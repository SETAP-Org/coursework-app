import {
    postAiChatMessageModel,
    getAiChatMessagesByProjectIdModel,
    deleteAiChatMessagesByProjectIdModel,
} from "../models/aiChatModels.js";
import { getFilesByProjectIdModel } from "../models/fileModels.js";
import { getProjectByIdModel } from "../models/projectModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import { getGeminiResponseWithFiles } from "../utils/gemini.js";
import { loadFilesForGemini } from "../utils/fileFetcher.js";

/**
 * POST /api/projects/:project_id/ai-chat
 *
 * Handle a new user message: fetch files, call Gemini, persist both turns,
 * return the assistant reply to the client.
 */
export async function postAiChatMessage(req, res) {
    try {
        const projectResponse = await getProjectByIdModel(req.params.project_id);
        const project = projectResponse.rows[0];

        const projectId = project.project_id;
        const messageContent = (req.body.messageContent ?? "").trim();

        if (!messageContent) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty.",
            });
        }

        // Resolve the user's database row from their Microsoft session.
        const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
        const dbUser = dbUserResult?.rows?.[0];
        if (!dbUser) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        // Store question first incase the gemini call fails
        const userInsert = await postAiChatMessageModel(
            projectId,
            dbUser.user_id,
            "user",
            messageContent,
        );
        const userTurn = userInsert.rows[0];

        // pull the project's files and resolve them into Gemini-ready
        // buffers. If anything goes wrong with file storage we degrade
        // gracefully to a plain text-only chat rather than failing the request.
        let filesForGemini = [];
        try {
            const filesResult = await getFilesByProjectIdModel(projectId);
            filesForGemini = await loadFilesForGemini(filesResult.rows);
        } catch (fileErr) {
            console.error(
                "AI chat: failed to load files, continuing without them:",
                fileErr.message,
            );
        }

        // call Gemini.
        let assistantText;
        try {
            assistantText = await getGeminiResponseWithFiles(
                messageContent,
                filesForGemini,
            );
        } catch (geminiErr) {
            console.error("Gemini call failed:", geminiErr);
            assistantText =
                "Sorry, I couldn't generate a response right now. " +
                "Please try again in a moment.";
        }

        // Store the assistant's reply in the database
        const assistantInsert = await postAiChatMessageModel(
            projectId,
            null,
            "assistant",
            assistantText,
        );
        const assistantTurn = assistantInsert.rows[0];

        return res.status(200).json({
            success: true,
            userMessage: userTurn,
            assistantMessage: assistantTurn,
        });
    } catch (err) {
        console.error("Error with postAiChatMessage:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to process AI chat message.",
        });
    }
}

/**
 * GET /api/projects/:project_id/ai-chat
 *
 * Return the project's full AI chat history. Used to paint the panel on
 * page-load.
 */
export async function getAiChatMessages(req, res) {
    try {
        const projectResponse = await getProjectByIdModel(req.params.project_id);
        const project = projectResponse.rows[0];

        const projectId = project.project_id;
        const data = await getAiChatMessagesByProjectIdModel(projectId);

        return res.status(200).json({
            success: true,
            messages: data.rows,
        });
    } catch (err) {
        console.error("Error with getAiChatMessages:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load AI chat history.",
        });
    }
}

/**
 * DELETE /api/projects/:project_id/ai-chat
 *
 * Wipe the project's AI chat history. Restricted to the team leader so a
 * single member can't nuke the conversation for everyone else.
 */
export async function clearAiChatHistory(req, res) {
    try {
        const projectResponse = await getProjectByIdModel(req.params.project_id);
        const project = projectResponse.rows[0];

        const projectId = project.project_id;

        const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
        const dbUser = dbUserResult?.rows?.[0];

        if (!dbUser || !project || project.team_leader_id !== dbUser.user_id) {
            return res.status(403).json({
                success: false,
                message: "Only the team leader can clear the AI chat history.",
            });
        }

        await deleteAiChatMessagesByProjectIdModel(projectId);

        return res.status(200).json({
            success: true,
            message: "AI chat history cleared.",
        });
    } catch (err) {
        console.error("Error with clearAiChatHistory:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to clear AI chat history.",
        });
    }
}
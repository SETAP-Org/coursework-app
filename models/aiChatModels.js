import { query } from "../db/connection.js";

/**
 * Insert a single message (user or assistant) into the project's AI history.
 *
 * @param {string} projectId   - UUID of the project this message belongs to.
 * @param {string|null} userId - UUID of the user who sent it; null for the
 *                               assistant's own replies.
 * @param {"user"|"assistant"} role
 * @param {string} content     - The plain-text message content.
 */
export async function postAiChatMessageModel(projectId, userId, role, content) {
    return await query(
        `
        INSERT INTO ai_chat_messages
            (project_id, user_id, role, content, ai_date_sent)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
        `,
        [projectId, userId, role, content],
    );
}

/**
 * Get the full ordered history for a project, oldest first. Used both to
 * paint the UI on page-load AND to feed Gemini for follow-up turns.
 */
export async function getAiChatMessagesByProjectIdModel(projectId) {
    return await query(
        `
        SELECT
            ai_message_id,
            project_id,
            user_id,
            role,
            content,
            ai_date_sent
        FROM ai_chat_messages
        WHERE project_id = $1
        ORDER BY ai_date_sent ASC;
        `,
        [projectId],
    );
}

/**
 * Wipe the entire conversation for a project. Called by the "Clear chat"
 * button (team-leader-only at the controller layer).
 */
export async function deleteAiChatMessagesByProjectIdModel(projectId) {
    return await query(
        `DELETE FROM ai_chat_messages WHERE project_id = $1;`,
        [projectId],
    );
}
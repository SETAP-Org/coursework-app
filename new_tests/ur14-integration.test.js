import { jest } from "@jest/globals";

const mockGetAiChatMessagesByProjectIdModel = jest.fn();
const mockPostAiChatMessageModel = jest.fn();
const mockDeleteAiChatMessagesByProjectIdModel = jest.fn();
const mockGetFilesByProjectIdModel = jest.fn();
const mockGetProjectByIdModel = jest.fn();
const mockIsUserMemberOfProjectModel = jest.fn();
const mockGetUserByMicrosoftIdModel = jest.fn();
const mockGetGeminiResponseWithFiles = jest.fn();
const mockLoadFilesForGemini = jest.fn();

await jest.unstable_mockModule("../models/aiChatModels.js", () => ({
    getAiChatMessagesByProjectIdModel: mockGetAiChatMessagesByProjectIdModel,
    postAiChatMessageModel: mockPostAiChatMessageModel,
    deleteAiChatMessagesByProjectIdModel: mockDeleteAiChatMessagesByProjectIdModel,
}));

await jest.unstable_mockModule("../models/fileModels.js", () => ({
    getFilesByProjectIdModel: mockGetFilesByProjectIdModel,
}));

await jest.unstable_mockModule("../models/projectModels.js", () => ({
    getProjectByIdModel: mockGetProjectByIdModel,
    isUserMemberOfProjectModel: mockIsUserMemberOfProjectModel,
    // unused by these routes but exported so other imports don't break
    postProjectModel: jest.fn(),
    postUserProjectModel: jest.fn(),
    getUserProjectsModel: jest.fn(),
    putTeamLeader: jest.fn(),
    deleteProjectByIdModel: jest.fn(),
}));

await jest.unstable_mockModule("../models/userModels.js", () => ({
    getUserByMicrosoftIdModel: mockGetUserByMicrosoftIdModel,
}));

await jest.unstable_mockModule("../utils/gemini.js", () => ({
    getGeminiResponseWithFiles: mockGetGeminiResponseWithFiles,
}));

await jest.unstable_mockModule("../utils/fileFetcher.js", () => ({
    loadFilesForGemini: mockLoadFilesForGemini,
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const aiRoutes = (await import("../routes/aiRoutes.js")).default;

const JOHN  = { user_id: "user-john" };   // team leader
const JULIA = { user_id: "user-julia" };  // member, not leader
const PROJECT = { project_id: "proj-1", team_leader_id: "user-john" };

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    const microsoftId = req.headers["x-test-user"];
    if (microsoftId) req.user = { microsoftId };
    next();
});
app.use("/api", aiRoutes);

describe('An authenticated user should be able to discuss details about the documents within their shared folder with an AI chatbot', () => {

    beforeEach(() => {
        mockGetUserByMicrosoftIdModel.mockImplementation(async (microsoftId) => {
            if (microsoftId === "ms-john")  return { rows: [JOHN] };
            if (microsoftId === "ms-julia") return { rows: [JULIA] };
            return { rows: [] };
        });
        mockIsUserMemberOfProjectModel.mockResolvedValue({ rows: [{ is_member: true }] });
        mockGetProjectByIdModel.mockResolvedValue({ rows: [PROJECT] });
        mockGetFilesByProjectIdModel.mockResolvedValue({ rows: [] });
        mockLoadFilesForGemini.mockResolvedValue([]);
        mockGetGeminiResponseWithFiles.mockReset();
        mockGetGeminiResponseWithFiles.mockResolvedValue("AI response");
        mockPostAiChatMessageModel.mockReset();
        mockDeleteAiChatMessagesByProjectIdModel.mockResolvedValue({ rows: [] });
    });

    // Returns the project's AI transcript
    test('valid: the last 4 chats from history are returned in chronological order', async () => {
        mockGetAiChatMessagesByProjectIdModel.mockResolvedValueOnce({ rows: [
            { ai_date_sent: "2024-01-01T00:00:00Z" },
            { ai_date_sent: "2024-01-02T00:00:00Z" },
            { ai_date_sent: "2024-01-03T00:00:00Z" },
            { ai_date_sent: "2024-01-04T00:00:00Z" },
        ]});

        const res = await request(app)
            .get("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.messages).toHaveLength(4);

        const dates = res.body.messages.map(m => new Date(m.ai_date_sent).getTime());
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
        }
    })

    test('valid: chat is returned empty as there is no history', async () => {
        mockGetAiChatMessagesByProjectIdModel.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .get("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-julia");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.messages).toHaveLength(0);
    })

    test('invalid: non-member access to shared chat', async () => {
        mockIsUserMemberOfProjectModel.mockResolvedValueOnce({ rows: [{ is_member: false }] });

        const res = await request(app)
            .get("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john");

        expect(res.status).toBe(403);
    })

    // Sends AI chat messages
    test('valid: member sends a message and AI replies', async () => {
        mockGetGeminiResponseWithFiles.mockResolvedValueOnce("All tasks are on track");
        mockPostAiChatMessageModel
            .mockResolvedValueOnce({ rows: [{ content: "What is the status?" }] })
            .mockResolvedValueOnce({ rows: [{ content: "All tasks are on track" }] });

        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john")
            .send({ messageContent: "What is the status?" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.userMessage.content).toBe("What is the status?");
        expect(res.body.assistantMessage.content).toBe("All tasks are on track");
    })

    test('valid: fallback message is returned and conversation is saved when AI is unavailable', async () => {
        mockGetGeminiResponseWithFiles.mockRejectedValueOnce(new Error("Gemini unavailable"));
        mockPostAiChatMessageModel
            .mockResolvedValueOnce({ rows: [{ content: "What is the status?" }] })
            .mockResolvedValueOnce({ rows: [{ content: "Sorry, I couldn't generate a response right now. Please try again in a moment." }] });

        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john")
            .send({ messageContent: "What is the status?" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.userMessage.content).toBe("What is the status?");
        expect(res.body.assistantMessage.content).toBe("Sorry, I couldn't generate a response right now. Please try again in a moment.");
    })

    test('valid: AI chat still works when file loading fails', async () => {
        mockLoadFilesForGemini.mockRejectedValueOnce(new Error("Storage unavailable"));
        mockGetGeminiResponseWithFiles.mockResolvedValueOnce("All tasks are on track.");
        mockPostAiChatMessageModel
            .mockResolvedValueOnce({ rows: [{ content: "What is the status?" }] })
            .mockResolvedValueOnce({ rows: [{ content: "All tasks are on track." }] });

        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john")
            .send({ messageContent: "What is the status?" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.assistantMessage.content).toBe("All tasks are on track.");
    })

    test('invalid: empty user message is rejected, not reaching the AI', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john")
            .send({ messageContent: "   " });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Message content cannot be empty.");
        expect(mockGetGeminiResponseWithFiles).not.toHaveBeenCalled();
    })

    test('invalid: user not found in the database', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-unknown");

        expect(res.status).toBe(401);
        expect(mockGetGeminiResponseWithFiles).not.toHaveBeenCalled();
    })

    test('invalid: outer db error returns 500', async () => {
        mockPostAiChatMessageModel.mockRejectedValueOnce(new Error("DB error"));

        const res = await request(app)
            .post("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john")
            .send({ messageContent: "What is the status?" });

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Failed to process AI chat message.");
    })

    // Deletes AI messages
    test('valid: team leader can clear the AI chat history', async () => {
        const res = await request(app)
            .delete("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("AI chat history cleared.");
        expect(mockDeleteAiChatMessagesByProjectIdModel).toHaveBeenCalledWith("proj-1");
    })

    test('invalid: only the team leader can clear the AI chat history', async () => {
        const res = await request(app)
            .delete("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-julia");

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Only the team leader can clear the AI chat history.");
    })

    test('invalid: database error during deletion', async () => {
        mockDeleteAiChatMessagesByProjectIdModel.mockRejectedValueOnce(new Error("DB error"));

        const res = await request(app)
            .delete("/api/projects/proj-1/ai-chat")
            .set("x-test-user", "ms-john");

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Failed to clear AI chat history.");
    })
})

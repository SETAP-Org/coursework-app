// UR14 integration tests: AI chatbot for shared folder documents

import request from "supertest";
import { jest } from "@jest/globals";
import { query } from "../db/connection.js";
import * as realAiChatModels from "../models/aiChatModels.js";

const mockGenerateContent = jest.fn();
const mockGetAiChatMessagesByProjectIdModel = jest.fn();
const mockPostAiChatMessageModel = jest.fn();
const mockDeleteAiChatMessagesByProjectIdModel = jest.fn();
const mockDownload = jest.fn();

await jest.unstable_mockModule("@google/genai", () => ({ // swap real Gemini SDK for a jest.fn() so tests never hit the real API
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: { generateContent: mockGenerateContent },
    })),
}));

await jest.unstable_mockModule("../utils/auth.js", () => ({ // replace passport/MSAL with a simple header-based identity so tests can set the user freely
    default: (app) => {
        app.use((req, res, next) => {
            const microsoftId = req.headers["x-test-microsoft-id"];
            if (microsoftId) req.user = { microsoftId };
            next();
        });
    }
}));

await jest.unstable_mockModule("../models/aiChatModels.js", () => { // wrap the real DB functions in jest.fn() so individual tests can override them without losing the default real behaviour
    mockGetAiChatMessagesByProjectIdModel.mockImplementation(
        realAiChatModels.getAiChatMessagesByProjectIdModel
    );
    mockPostAiChatMessageModel.mockImplementation(
        realAiChatModels.postAiChatMessageModel
    );
    mockDeleteAiChatMessagesByProjectIdModel.mockImplementation(
        realAiChatModels.deleteAiChatMessagesByProjectIdModel
    );
    return {
        ...realAiChatModels,
        getAiChatMessagesByProjectIdModel: mockGetAiChatMessagesByProjectIdModel,
        postAiChatMessageModel: mockPostAiChatMessageModel,
        deleteAiChatMessagesByProjectIdModel: mockDeleteAiChatMessagesByProjectIdModel,
    };
});

await jest.unstable_mockModule("../utils/supabase.js", () => ({ // stop any real Supabase calls
    SHARED_FOLDERS_BUCKET: "test-bucket",
    supabase: {
        storage: {
            from: () => ({ download: mockDownload }),
        },
    },
}));

await jest.unstable_mockModule("mammoth", () => ({
    default: {
        extractRawText: jest.fn().mockResolvedValue({ value: "Extracted docx content." }),
    },
}));

await jest.unstable_mockModule("xlsx", () => ({
    read: jest.fn().mockReturnValue({ SheetNames: ["Sheet1"], Sheets: { Sheet1: {} } }),
    utils: { sheet_to_csv: jest.fn().mockReturnValue("col1,col2\nval1,val2") },
}));

await jest.unstable_mockModule("officeparser", () => ({
    default: { parseOfficeAsync: jest.fn().mockResolvedValue("") },
}));

await jest.unstable_mockModule("../utils/fileFetcher.js", () => ({ // mock fileFetcher so API tests don't trigger real file downloads
    loadFilesForGemini: jest.fn().mockResolvedValue([]),
}));

const { default: app } = await import("../app.js");
const { loadFilesForGemini } = await import("../utils/fileFetcher.js"); // the mock version used to simulate file loading failures

describe('An authenticated user should be able to discuss details about the documents within their shared folder with an AI chatbot', () => {

    beforeEach(() => {
        mockGenerateContent.mockReset();
        mockPostAiChatMessageModel.mockReset();
        mockPostAiChatMessageModel.mockImplementation(realAiChatModels.postAiChatMessageModel);
        mockDeleteAiChatMessagesByProjectIdModel.mockReset();
        mockDeleteAiChatMessagesByProjectIdModel.mockImplementation(realAiChatModels.deleteAiChatMessagesByProjectIdModel);
        mockDownload.mockReset();
        const fakeArrayBuffer = new Uint8Array(Buffer.from("fake content")).buffer;
        mockDownload.mockResolvedValue({ data: { arrayBuffer: async () => fakeArrayBuffer }, error: null });
    });

    // Returns the project's AI transcript
    test('valid: the last 4 chats from history are returned in cronological order', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .get(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.messages).toHaveLength(4);

        const dates = response.body.messages.map(m => new Date(m.ai_date_sent).getTime());
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
        }
    })

    test('valid: chat is returned empty as there is no history', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Empty Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .get(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-julia");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.messages).toHaveLength(0);
    })

    test('invalid: non-member access to shared chat', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .get(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-bob");

        expect(response.status).toBe(403);
    })

    // Sends AI chat messages
    test('valid: member sends a message and AI replies', async () => {
        mockGenerateContent.mockResolvedValue({ text: 'All tasks are on track' });

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john")
            .send({ messageContent: 'What is the status?' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.userMessage.content).toBe('What is the status?');
        expect(response.body.assistantMessage.content).toBe('All tasks are on track');
    })

    test('valid: fallback message is returned and conversation is saved when AI is unavailable', async () => {
        mockGenerateContent.mockRejectedValue(new Error('Gemini unavailable'));

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john")
            .send({ messageContent: 'What is the status?' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.userMessage.content).toBe('What is the status?');
        expect(response.body.assistantMessage.content).toBe("Sorry, I couldn't generate a response right now. Please try again in a moment.");
    })

    test('valid: AI chat still works when file loading fails', async () => {
        loadFilesForGemini.mockRejectedValueOnce(new Error('Storage unavailable'));
        mockGenerateContent.mockResolvedValue({ text: 'All tasks are on track.' });

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john")
            .send({ messageContent: 'What is the status?' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.userMessage.content).toBe('What is the status?');
        expect(response.body.assistantMessage.content).toBe('All tasks are on track.');
    })

    test('invalid: empty user message is rejected, not reaching the database', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john")
            .send({ messageContent: '   ' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Message content cannot be empty.');
        expect(mockGenerateContent).not.toHaveBeenCalled();
    })

    test('invalid: user not found in the database', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-unknown");

        expect(response.status).toBe(401);
        expect(mockGenerateContent).not.toHaveBeenCalled();
    })

    test('invalid: outer db error returns 500 with failed to process message', async () => {
        mockPostAiChatMessageModel.mockRejectedValueOnce(new Error('DB error'));

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john")
            .send({ messageContent: 'What is the status?' });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Failed to process AI chat message.');
    })

    // Deletes AI messages
    test('valid: team leader can clear the AI chat history', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('AI chat history cleared.');

        const checkRes = await query("SELECT * FROM ai_chat_messages WHERE project_id = $1", [pid]);
        expect(checkRes.rows).toHaveLength(0);
    })

    test('invalid: only the team leader can clear the AI chat history', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-julia");

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Only the team leader can clear the AI chat history.');
    })

    test('invalid: database error during deletion', async () => {
        mockDeleteAiChatMessagesByProjectIdModel.mockRejectedValueOnce(new Error('DB error'));

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'AI Test Project'");
        const pid = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete(`/api/projects/${pid}/ai-chat`)
            .set("x-test-microsoft-id", "ms-john");

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Failed to clear AI chat history.');
    })
})

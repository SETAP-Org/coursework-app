import { jest } from "@jest/globals";

const mockRemove = jest.fn();
const mockGetFilesByProjectIdModel = jest.fn();
const mockPostFileModel = jest.fn();
const mockGetFileByProjectIdAndFileIdModel = jest.fn();
const mockDeleteFileByProjectIdAndFileIdModel = jest.fn();
const mockGetUserByMicrosoftIdModel = jest.fn();
const mockIsUserMemberOfProjectModel = jest.fn();

await jest.unstable_mockModule("../utils/supabase.js", () => ({
    SHARED_FOLDERS_BUCKET: "test-bucket",
    supabase: {
        storage: {
            from: () => ({
                createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "https://fake-url.com/file" } }),
                createSignedUploadUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "https://fake-upload-url.com", token: "fake-token" } }),
                remove: mockRemove,
            }),
        },
    },
}));

await jest.unstable_mockModule("../models/fileModels.js", () => ({
    getFilesByProjectIdModel: mockGetFilesByProjectIdModel,
    postFileModel: mockPostFileModel,
    getFileByProjectIdAndFileIdModel: mockGetFileByProjectIdAndFileIdModel,
    deleteFileByProjectIdAndFileIdModel: mockDeleteFileByProjectIdAndFileIdModel,
}));

await jest.unstable_mockModule("../models/userModels.js", () => ({
    getUserByMicrosoftIdModel: mockGetUserByMicrosoftIdModel,
}));

await jest.unstable_mockModule("../models/projectModels.js", () => ({
    isUserMemberOfProjectModel: mockIsUserMemberOfProjectModel,
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const fileRoutes = (await import("../routes/fileRoutes.js")).default;

const ALICE = { user_id: "user-alice" };
const BOB   = { user_id: "user-bob" };
const FAKE_FILE = { file_id: "file-1", file_name: "report.pdf", storage_path: "projects/proj-1/report.pdf", project_id: "proj-1" };

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    const microsoftId = req.headers["x-test-user"];
    if (microsoftId) req.user = { microsoftId };
    next();
});
app.use("/api", fileRoutes);

describe('The system should allow users to view and download/open files from a shared project folder', () => {

    beforeEach(() => {
        mockRemove.mockResolvedValue({ error: null });
        mockGetUserByMicrosoftIdModel.mockImplementation(async (microsoftId) => {
            if (microsoftId === "ms-alice") return { rows: [ALICE] };
            if (microsoftId === "ms-bob")   return { rows: [BOB] };
            return { rows: [] };
        });
        mockIsUserMemberOfProjectModel.mockResolvedValue({ rows: [{ is_member: true }] });
        mockGetFileByProjectIdAndFileIdModel.mockResolvedValue({ rows: [FAKE_FILE] });
        mockDeleteFileByProjectIdAndFileIdModel.mockResolvedValue({ rows: [FAKE_FILE] });
    });

    // File Upload
    test('valid: 1 MB upload', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: 1 * 1024 * 1024 });

        expect(res.status).toBe(200);
        expect(res.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(res.body.storagePath).toMatch(/^projects\/proj-1\//);
    })

    // 10 MB is the exact limit so this should still pass
    test('valid: exactly 10 MB upload', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: 10 * 1024 * 1024 });

        expect(res.status).toBe(200);
        expect(res.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(res.body.storagePath).toMatch(/^projects\/proj-1\//);
    })

    test('invalid: 0 MB file', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: 0 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: negative file size', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: -1 * 1024 * 1024 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: non-numeric file size', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: "big" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Invalid file size. Size must be a number.");
    })

    // one byte over the limit to confirm the boundary is enforced
    test('invalid: over limit by 1 byte', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/upload-init")
            .send({ fileName: "report.pdf", size: (10 * 1024 * 1024) + 1 });

        expect(res.status).toBe(413);
        expect(res.body.error).toBe("File too large. Make sure it is up to 10 MB.");
    })

    // Get File Metadata
    test('valid: project with files', async () => {
        mockGetFilesByProjectIdModel.mockResolvedValueOnce({ rows: [{ file_name: "report.pdf" }] });

        const res = await request(app).get("/api/projects/proj-1/files/metadata");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].file_name).toBe("report.pdf");
    })

    test('valid: project with no files', async () => {
        mockGetFilesByProjectIdModel.mockResolvedValueOnce({ rows: [] });

        const res = await request(app).get("/api/projects/proj-empty/files/metadata");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    })

    // Add File Metadata
    test('valid: metadata insert', async () => {
        mockPostFileModel.mockResolvedValueOnce({ rows: [{ file_name: "notes.txt", project_id: "proj-1" }] });

        const res = await request(app)
            .post("/api/projects/proj-1/files/metadata")
            .send({ fileName: "notes.txt", storagePath: "projects/proj-1/notes.txt", size: 1024 });

        expect(res.status).toBe(201);
        expect(res.body.file_name).toBe("notes.txt");
        expect(res.body.project_id).toBe("proj-1");
    })

    test('invalid: missing storagePath', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/metadata")
            .send({ fileName: "notes.txt", size: 1024 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Error, missing required fields");
    })

    test('invalid: non-numeric size', async () => {
        const res = await request(app)
            .post("/api/projects/proj-1/files/metadata")
            .send({ fileName: "notes.txt", storagePath: "projects/proj-1/notes.txt", size: "big" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Error, missing required fields");
    })

    // Download File
    test('valid: valid storagePath', async () => {
        const res = await request(app).get("/api/projects/proj-1/files/download?storagePath=projects/proj-1/report.pdf");

        expect(res.status).toBe(200);
        expect(res.body.signedUrl).toBe("https://fake-url.com/file");
    })

    test('invalid: missing storagePath', async () => {
        const res = await request(app).get("/api/projects/proj-1/files/download");

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing required field: storagePath");
    })

    // Delete File
    test('valid: member deletes existing file', async () => {
        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1")
            .set("x-test-user", "ms-alice");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.file.file_name).toBe("report.pdf");
    })

    test('invalid: user not in DB', async () => {
        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1")
            .set("x-test-user", "ms-nonexistent");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("User not found");
    })

    test('invalid: user is not a member of the project', async () => {
        mockIsUserMemberOfProjectModel.mockResolvedValueOnce({ rows: [{ is_member: false }] });

        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1")
            .set("x-test-user", "ms-bob");

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("Access denied");
    })

    test('invalid: file does not exist in project', async () => {
        mockGetFileByProjectIdAndFileIdModel.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .delete("/api/projects/proj-1/files/no-such-file")
            .set("x-test-user", "ms-alice");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("File not found");
    })

    test('invalid: Supabase remove fails', async () => {
        mockRemove.mockResolvedValueOnce({ error: { message: "Storage failure" } });

        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1")
            .set("x-test-user", "ms-alice");

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Failed to remove file from shared folder");
    })

    test('invalid: DB delete returns 0 rows after storage cleanup', async () => {
        mockDeleteFileByProjectIdAndFileIdModel.mockResolvedValueOnce({ rows: [] });

        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1")
            .set("x-test-user", "ms-alice");

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("File not found");
    })

    test('invalid: unexpected throw inside handler', async () => {
        // no x-test-user header → req.user is undefined → controller throws TypeError
        const res = await request(app)
            .delete("/api/projects/proj-1/files/file-1");

        expect(res.status).toBe(500);
    })
})

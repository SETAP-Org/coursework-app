// UR10 integration tests: viewing and downloading files from a shared project folder

import request from "supertest";
import { jest } from "@jest/globals";
import { query } from "../db/connection.js";
import * as realFileModels from "../models/fileModels.js";

// declared here so individual tests can swap the behaviour with mockResolvedValueOnce
const mockRemove = jest.fn().mockResolvedValue({ error: null });

// stubs all Supabase storage operations so no real bucket calls happen during tests
await jest.unstable_mockModule("../utils/supabase.js", () => ({
  SHARED_FOLDERS_BUCKET: "test-bucket",
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: "https://fake-url.com/file" }
        }),
        createSignedUploadUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: "https://fake-upload-url.com", token: "fake-token" }
        }),
        remove: mockRemove
      })
    }
  }
}));

// swaps Passport out for a simple header check so we can set req.user without a real MS login
await jest.unstable_mockModule("../utils/auth.js", () => ({
  default: (app) => {
    app.use((req, res, next) => {
      const microsoftId = req.headers["x-test-microsoft-id"];
      if (microsoftId) {
        req.user = { microsoftId };
      }
      next();
    });
  }
}));

// wrapped in jest.fn() so the race condition test can override a single call without affecting the others
const mockDeleteFileByProjectIdAndFileIdModel = jest.fn();

await jest.unstable_mockModule("../models/fileModels.js", () => {
  mockDeleteFileByProjectIdAndFileIdModel.mockImplementation(realFileModels.deleteFileByProjectIdAndFileIdModel);
  return {
    ...realFileModels,
    deleteFileByProjectIdAndFileIdModel: mockDeleteFileByProjectIdAndFileIdModel,
  };
});

// import app after all mocks are registered so the modules pick up the fakes
const { default: app } = await import("../app.js");

describe('The system should allow users to view and download/open files from a shared project folder', () => {

    // File Upload
    test('valid: 1 MB upload', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: 1 * 1024 * 1024 });

        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(response.body.storagePath).toMatch(/^projects\/test-project-123\//);
    })

    // 10 MB is the exact limit so this should still pass
    test('valid: exactly 10 MB upload', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: 10 * 1024 * 1024 });

        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(response.body.storagePath).toMatch(/^projects\/test-project-123\//);
    })

    test('invalid: 0 MB file', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: negative file size', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: -1 * 1024 * 1024 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: non-numeric file size', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: "big" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be a number.");
    })

    // one byte over the limit to confirm the boundary is enforced
    test('invalid: over limit by 1 byte', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({ fileName: "report.pdf", size: (10 * 1024 * 1024) + 1 });

        expect(response.status).toBe(413);
        expect(response.body.error).toBe("File too large. Make sure it is up to 10 MB.");
    })

    // Get File Metadata
    test('valid: project with files', async () => {
        // pull the real project ID from the seed data rather than hardcoding it
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app).get(`/api/projects/${projectId}/files/metadata`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].file_name).toBe('report.pdf');
    })

    test('valid: project with no files', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app).get(`/api/projects/${projectId}/files/metadata`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    })

    // Add File Metadata
    test('valid: metadata insert', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${projectId}/files/metadata`)
            .send({
                fileName: "notes.txt",
                storagePath: `projects/${projectId}/notes.txt`,
                size: 1024
            });

        expect(response.status).toBe(201);
        expect(response.body.file_name).toBe("notes.txt");
        expect(response.body.project_id).toBe(projectId);
    })

    test('invalid: missing storagePath', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${projectId}/files/metadata`)
            .send({
                fileName: "notes.txt",
                size: 1024
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Error, missing required fields");
    })

    test('invalid: non-numeric size in storagePath', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .post(`/api/projects/${projectId}/files/metadata`)
            .send({
                fileName: "notes.txt",
                storagePath: `projects/${projectId}/notes.txt`,
                size: "big"
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Error, missing required fields");
    })

    // Download File
    test('valid: valid storagePath', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app).get(`/api/projects/${projectId}/files/download?storagePath=projects/${projectId}/report.pdf`);

        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBe("https://fake-url.com/file");
    })

    test('invalid: missing storagePath', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app).get(`/api/projects/${projectId}/files/download`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing required field: storagePath");
    })

    // Delete File
    test('valid: member deletes existing file', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // look up the real file ID inserted by the seed rather than hardcoding it
        const fileRes = await query("SELECT file_id FROM files WHERE file_name = 'report.pdf' AND project_id = $1", [projectId]);
        const fileId = fileRes.rows[0].file_id;

        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/${fileId}`)
            .set("X-Test-Microsoft-Id", "ms-alice");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.file.file_name).toBe("report.pdf");
    })

    test('invalid: user not in DB', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/some-file-id`)
            .set("X-Test-Microsoft-Id", "ms-nonexistent");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("User not found");
    })

    test('invalid: user is not a member of the project', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'");
        const projectId = projectRes.rows[0].project_id;

        // bob is in the DB but never joined Empty Project so this should 403
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/some-file-id`)
            .set("X-Test-Microsoft-Id", "ms-bob");

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Access denied");
    })

    test('invalid: file does not exist in project', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // alice passes membership checks but this UUID was never inserted into files
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/682755a2-91cb-42c8-a078-e843a9a71597`)
            .set("X-Test-Microsoft-Id", "ms-alice");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("File not found");
    })

    test('invalid: Supabase remove fails', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // the earlier happy path test deleted report.pdf so a new file is needed
        const insertRes = await query(
            "INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded) VALUES ($1, 'temp.pdf', $2, 1024, NOW()) RETURNING file_id",
            [projectId, `projects/${projectId}/temp.pdf`]
        );
        const fileId = insertRes.rows[0].file_id;

        // force Supabase to return an error just for this one call
        mockRemove.mockResolvedValueOnce({ error: { message: "Storage failure" } });

        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/${fileId}`)
            .set("X-Test-Microsoft-Id", "ms-alice");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to remove file from shared folder");
    })

    test('invalid: DB delete returns 0 rows after storage cleanup', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // insert a file and then force the delete model to return nothing
        const insertRes = await query(
            "INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded) VALUES ($1, 'ghost.pdf', $2, 1024, NOW()) RETURNING file_id",
            [projectId, `projects/${projectId}/ghost.pdf`]
        );
        const fileId = insertRes.rows[0].file_id;

        // make the model return no rows as if the file disappeared mid-request
        mockDeleteFileByProjectIdAndFileIdModel.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/${fileId}`)
            .set("X-Test-Microsoft-Id", "ms-alice");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("File not found");
    })

    test('invalid: unexpected throw inside handler', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // no header means req.user is undefined and the handler throws a TypeError
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/00000000-0000-0000-0000-000000000000`);

        expect(response.status).toBe(500);
    })
})

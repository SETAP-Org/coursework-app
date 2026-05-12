// UR10: Authenticated users should be able to view & download/open files from a shared project folder

import request from "supertest";
import { jest } from "@jest/globals";
import { query } from "../db/connection.js";
import * as realFileModels from "../models/fileModels.js";

// kept outside the mock so individual tests can override it with mockResolvedValueOnce
const mockRemove = jest.fn().mockResolvedValue({ error: null });

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

// replaces Passport with a simple middleware - any request with the X-Test-Microsoft-Id
// header gets req.user set, mimicking what Passport would do after a real MS login
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

// wraps the real delete model in a jest.fn() so the race condition test can
// override it for one call without affecting any other test
const mockDeleteFileByProjectIdAndFileIdModel = jest.fn();

await jest.unstable_mockModule("../models/fileModels.js", () => {
  mockDeleteFileByProjectIdAndFileIdModel.mockImplementation(realFileModels.deleteFileByProjectIdAndFileIdModel);
  return {
    ...realFileModels,
    deleteFileByProjectIdAndFileIdModel: mockDeleteFileByProjectIdAndFileIdModel,
  };
});

const { default: app } = await import("../app.js");

describe('The system should allow users to view and download/open files from a shared project folder', () => {
    
    // File Upload:
    test('valid: 1 MB upload', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: 1 * 1024 * 1024});

        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(response.body.storagePath).toMatch(/^projects\/test-project-123\//);
    })

    test('valid: exactly 10 MB upload', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: 10 * 1024 * 1024});

        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBe("https://fake-upload-url.com");
        expect(response.body.storagePath).toMatch(/^projects\/test-project-123\//);
    })

    test('invalid: 0 MB file', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: 0});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: negative file size', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: -1 * 1024 * 1024});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be greater than 0.");
    })

    test('invalid: non-numeric file size', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: "big"});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file size. Size must be a number.");
    })

    test('invalid: over limit by 1 byte', async () => {
        const response = await request(app)
            .post("/api/projects/test-project-123/files/upload-init")
            .send({fileName: "report.pdf", size: (10 * 1024 * 1024) + 1});

        expect(response.status).toBe(413);
        expect(response.body.error).toBe("File too large. Make sure it is up to 10 MB.");
    })

    // Get File Metadata
    test('valid: project with files', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app).get(`/api/projects/${projectId}/files/metadata`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].file_name).toBe('report.pdf');
    })

    test('valid: project with no files', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Empty Project'")
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

        const response = await request (app)
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

        const response = await request (app)
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

        // Bob exists in the DB but was never added to Empty Project's USER_PROJECTS
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/some-file-id`)
            .set("X-Test-Microsoft-Id", "ms-bob");

        expect(response.status).toBe(403);
        expect(response.body.error).toBe("Access denied");
    })

    test('invalid: file does not exist in project', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // Alice is a member so passes auth checks, but this UUID does not exist in files
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/682755a2-91cb-42c8-a078-e843a9a71597

`)
            .set("X-Test-Microsoft-Id", "ms-alice");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("File not found");
    })

    test('invalid: Supabase remove fails', async () => {
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        // report.pdf was deleted by the happy path test above, so insert a fresh file
        const insertRes = await query(
            "INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded) VALUES ($1, 'temp.pdf', $2, 1024, NOW()) RETURNING file_id",
            [projectId, `projects/${projectId}/temp.pdf`]
        );
        const fileId = insertRes.rows[0].file_id;

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

        // insert a file then force the DB delete to return nothing, simulating a race condition
        // where the row disappears between the SELECT and DELETE
        const insertRes = await query(
            "INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded) VALUES ($1, 'ghost.pdf', $2, 1024, NOW()) RETURNING file_id",
            [projectId, `projects/${projectId}/ghost.pdf`]
        );
        const fileId = insertRes.rows[0].file_id;

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

        // no X-Test-Microsoft-Id header means req.user is undefined, causing a TypeError in the handler
        const response = await request(app)
            .delete(`/api/projects/${projectId}/files/00000000-0000-0000-0000-000000000000`);

        expect(response.status).toBe(500);
    })
})

const { mimeTypeFromFileName } = await import("../utils/fileFetcher.js");

test('valid: pdf extension resolves correct MIME type', () => {
    expect(mimeTypeFromFileName("report.pdf")).toBe("application/pdf");
})

test('valid: uppercase extension resolves correct MIME type', () => {
    expect(mimeTypeFromFileName("DATA.CSV")).toBe("text/csv");
})

test('valid: markdown extension resolves correct MIME type', () => {
    expect(mimeTypeFromFileName("notes.md")).toBe("text/markdown");
})

test('valid: office docx extension resolves correct MIME type', () => {
    expect(mimeTypeFromFileName("report.docx")).toBe("text/plain");
})

test('invalid: unknown extension falls back to octet-stream', () => {
    expect(mimeTypeFromFileName("image.png")).toBe("application/octet-stream");
})

test('invalid: no extension falls back to octet-stream', () => {
    expect(mimeTypeFromFileName("noext")).toBe("application/octet-stream");
})

test('invalid: empty filename falls back to octet-stream', () => {
    expect(mimeTypeFromFileName("")).toBe("application/octet-stream");
})

// User Requirement 4: Authenticated users assigned as a team leader should be able to manage members for their projects

import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

describe("addUserToProject", () => {
    test("Should add an existing user to a project successfully", async () => {
        const { default: app } = await import("../app.js");

        // get IDs from seed data — charlie exists but is not yet in 'Test Project'
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .post("/api/projects/user")
            .send({ username: "charlie", projectId });

        // expect successful HTTP response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User successfully added to the project!");

        // verify the record was inserted into the database
        const dbResult = await query(
            `SELECT * FROM user_projects WHERE user_id = $1 AND project_id = $2`,
            [response.body.userId, projectId]
        );

        expect(dbResult.rows.length).toBe(1);
    });

    test("Should fail to add a non-existent user to a project", async () => {
        const { default: app } = await import("../app.js");

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .post("/api/projects/user")
            .send({ username: "nonexistentuser123", projectId });

        // expect failure — user does not exist
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User does not exist!");

        // verify nothing was inserted into the database
        const dbResult = await query(
            `SELECT * FROM user_projects
             JOIN users ON user_projects.user_id = users.user_id
             WHERE users.username = 'nonexistentuser123' AND user_projects.project_id = $1`,
            [projectId]
        );

        expect(dbResult.rows.length).toBe(0);
    });
});

describe("removeUserFromProject", () => {
    test("Should remove an existing member from a project successfully", async () => {
        const { default: app } = await import("../app.js");

        // get IDs from seed data — bob is seeded as a member of 'Test Project'
        const bobRes = await query("SELECT user_id FROM users WHERE username = 'bob'");
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const userId = bobRes.rows[0].user_id;
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete("/api/projects/user")
            .send({ userId, projectId });

        // expect successful HTTP response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("You have been removed from this project!");

        // verify the record was removed from the database
        const dbResult = await query(
            `SELECT * FROM user_projects WHERE user_id = $1 AND project_id = $2`,
            [userId, projectId]
        );

        expect(dbResult.rows.length).toBe(0);
    });

    test("Should fail to remove a user when no userId is provided", async () => {
        const { default: app } = await import("../app.js");

        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete("/api/projects/user")
            .send({ projectId });

        // expect failure — userId is missing
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No user ID provided");

        // verify alice's membership (the remaining seeded member) is untouched
        const aliceRes = await query("SELECT user_id FROM users WHERE username = 'alice'");
        const dbResult = await query(
            `SELECT * FROM user_projects WHERE user_id = $1 AND project_id = $2`,
            [aliceRes.rows[0].user_id, projectId]
        );

        expect(dbResult.rows.length).toBe(1);
    });
});

describe("removeProject", () => {
    test("Should delete an existing project successfully", async () => {
        const { default: app } = await import("../app.js");

        // 'Test Project 2' is seeded with alice only and not depended on by other tests
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project 2'");
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .delete(`/api/projects/${projectId}`);

        // expect successful HTTP response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("The project has been deleted!");

        // verify the project no longer exists in the database
        const dbResult = await query(
            `SELECT * FROM projects WHERE project_id = $1`,
            [projectId]
        );

        expect(dbResult.rows.length).toBe(0);
    });

    test("Should fail to delete a project that does not exist", async () => {
        const { default: app } = await import("../app.js");

        const fakeProjectId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .delete(`/api/projects/${fakeProjectId}`);

        // expect failure — project not found
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Project could not be found");

        // verify the real project is still intact
        const dbResult = await query(
            `SELECT * FROM projects WHERE project_name = 'Test Project'`
        );

        expect(dbResult.rows.length).toBe(1);
    });
});

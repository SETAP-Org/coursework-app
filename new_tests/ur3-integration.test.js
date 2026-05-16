// User Requirement 3: An authenticated user assigned as a team leader should be able to assign a team leader for a project

import { jest, describe, test } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

describe('updateTeamLeader', () => {
    test('Should succeed with valid input', async () => {
        const { default: app } = await import("../app.js");

        // get the relevant database data
        const bobRes = await query("SELECT user_id FROM users WHERE username = 'bob'")
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        
        // attempting to change team leader
        const newLeaderId = bobRes.rows[0].user_id;
        const projectId = projectRes.rows[0].project_id;
        
        const response = await request(app)
            .put("/api/projects/leader")
            .send({ newLeaderId, projectId });

        // expecting success
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("The team leader has been changed");
    });

    test('Should fail with unknown projectId', async () => {
        jest.resetModules();
        const actualProjectModels = await import('../models/projectModels.js');
        jest.unstable_mockModule('../models/projectModels.js', () => ({
            ...actualProjectModels,
            putTeamLeader: jest.fn()
        }));

        const { default: app } = await import("../app.js");

        // get the relevant database data
        const bobRes = await query("SELECT user_id FROM users WHERE username = 'bob'");
        
        // attempting to change the team leader
        const newLeaderId = bobRes.rows[0].user_id;
        const fakeProjectId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
            .put("/api/projects/leader")
            .send({ newLeaderId, projectId: fakeProjectId });

        // expecting failure
        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch("Database error");
    });

    test('Should fail with missing projectId', async () => {
        const { default: app } = await import("../app.js");

        // get the relevant database data
        const bobRes = await query("SELECT user_id FROM users WHERE username = 'bob'");
        
        // attempting to change the team leader
        const newLeaderId = bobRes.rows[0].user_id;

        const response = await request(app)
            .put("/api/projects/leader")
            .send({ newLeaderId });

        // expecting failure
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch("Missing projectId");
    });

    test('Should fail with missing newLeaderId', async () => {
        const { default: app } = await import("../app.js");
        
        // get the relevant database data
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
        
        // attempting to change the team leader
        const projectId = projectRes.rows[0].project_id;

        const response = await request(app)
            .put("/api/projects/leader")
            .send({ projectId });

        // expecting failute
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch("Missing newLeaderId");
    });
    
    test('Should fail after error from model to update team leader', async () => {
        const { default: app } = await import("../app.js");
        const projectModels = await import('../models/projectModels.js');

        // mock model to give back error
        projectModels.putTeamLeader.mockImplementation(() => {
            throw new Error('DB Error');
        });
    
        // get the relevant database data
        const bobRes = await query("SELECT user_id FROM users WHERE username = 'bob'");
        const projectRes = await query("SELECT project_id FROM projects WHERE project_name = 'Test Project'");
    
        // attempting to change team leader
        const newLeaderId = bobRes.rows[0].user_id;
        const projectId = projectRes.rows[0].project_id;
    
        const response = await request(app)
            .put("/api/projects/leader")
            .send({ newLeaderId, projectId });
    
        // expecting failure
        expect(response.status).toBe(500);
        expect(response.body.message).toMatch("Database error");
    
        projectModels.putTeamLeader.mockReset();
    });
})
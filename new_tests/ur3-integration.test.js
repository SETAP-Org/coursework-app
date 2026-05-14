import { jest } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

jest.unstable_mockModule('../models/projectModels.js', () => ({
    ...jest.requireActual('../models/projectModels.js'),
    putTeamLeader: jest.fn()
}));

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
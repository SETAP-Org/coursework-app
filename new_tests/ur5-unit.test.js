// User Requirement 3: An authenticated user assigned as a team leader should be able to assign a team leader for a project

import { updateTeamLeader } from "../controllers/projectControllers.js";
import app from "../app.js";
import request from "supertest";
import { query } from "../db/connection.js";

describe("The system should allow users assigned as team leaders to assign a new team leader", () => {
  // After each test, reset the team leader back to alice so other test
  // files that expect alice to be the team leader are not affected.
  afterEach(async () => {
    const aliceRes = await query(
      "SELECT user_id FROM users WHERE username = 'alice'",
    );
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );
    await query(
      "UPDATE projects SET team_leader_id = $1 WHERE project_id = $2",
      [aliceRes.rows[0].user_id, projectRes.rows[0].project_id],
    );
  });

  test("Should succeed with valid input", async () => {
    // get the relevant database data
    const bobRes = await query(
      "SELECT user_id FROM users WHERE username = 'bob'",
    );
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );

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

  test("Should fail with unknown projectId", async () => {
    // get the relevant database data
    const bobRes = await query(
      "SELECT user_id FROM users WHERE username = 'bob'",
    );

    // attempting to change the team leader
    const newLeaderId = bobRes.rows[0].user_id;
    const fakeProjectId = "00000000-0000-0000-0000-000000000000";

    const response = await request(app)
      .put("/api/projects/leader")
      .send({ newLeaderId, projectId: fakeProjectId });

    // expecting failure
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch("Project not found");
  });

  test("Should fail with missing projectId", async () => {
    // get the relevant database data
    const bobRes = await query(
      "SELECT user_id FROM users WHERE username = 'bob'",
    );

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

  test("Should fail with missing newLeaderId", async () => {
    // get the relevant database data
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );

    // attempting to change the team leader
    const projectId = projectRes.rows[0].project_id;

    const response = await request(app)
      .put("/api/projects/leader")
      .send({ projectId });

    // expecting failure
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch("Missing newLeaderId");
  });
});

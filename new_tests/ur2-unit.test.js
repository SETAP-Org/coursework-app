// User Requirement 2: An authenticated user should be able to create a project

import request from "supertest";
import app from "../app.js";

describe("The system should allow users to create a project", () => {
  test("Should fail when user is not authenticated", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .send({ project_name: "P1", project_deadline: "2026-12-31" });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Unauthorised");
  });
});

// User Requirement 6: An authenticated user assigned to tasks should be able to update the status of the task

import request from "supertest";
import app from "../app.js";

describe("The system should allow users to update the completion status of tasks assigned to them", () => {
  test("Should fail when user is not authenticated", async () => {
    const response = await request(app)
      .put(
        "/api/projects/00000000-0000-0000-0000-000000000000/tasks/00000000-0000-0000-0000-000000000000/updateStatus",
      )
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Unauthorised");
  });
});

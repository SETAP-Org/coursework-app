// User Requirement 11: Authenticated users should be able to view team member contributions

import request from "supertest";
import app from "../app.js";

describe("The system should allow users to view each user in the project's contribution as a percentage", () => {
  test("Fails to return contributions when the user is not authenticated", async () => {
    const response = await request(app).get(
      "/api/contributions/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Unauthorised");
  });
});

// User Requirement 11: Authenticated users should be able to view team member contributions
//
import { jest } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

jest.unstable_mockModule("../utils/auth.js", () => ({
  default: jest.fn((app) => {
    app.use((req, res, next) => {
      const testUser = req.headers["x-test-user"];
      if (testUser) req.user = JSON.parse(testUser);
      next();
    });
  }),
}));

jest.unstable_mockModule("../models/contributionModels.js", () => ({
  ...jest.requireActual("../models/contributionModels.js"),
  getContributionsByProjectIdModel: jest.fn(),
}));

const { default: app } = await import("../app.js");
const contributionModels = await import("../models/contributionModels.js");

// Before each test, reset the mock back to its real implementation.
beforeEach(() => {
  contributionModels.getContributionsByProjectIdModel.mockImplementation(
    jest.requireActual("../models/contributionModels.js")
      .getContributionsByProjectIdModel,
  );
});

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("The system should allow users to view each user in the project's contribution as a percentage", () => {
  let projectId;
  let project2Id;

  beforeAll(async () => {
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );
    projectId = projectRes.rows[0].project_id;

    const project2Res = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project 2'",
    );
    project2Id = project2Res.rows[0].project_id;
  });

  test("Successfully returns contribution data when the project has completed tasks", async () => {
    const response = await request(app)
      .get(`/api/contributions/${projectId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.contributionData).toBeDefined();
    expect(response.body.contributionData.project_weight).toBe(4);
    expect(response.body.contributionData.contributions).toBeDefined();
  });

  test("Successfully returns correct percentage contributions when three members have different completed task weights", async () => {
    const response = await request(app)
      .get(`/api/contributions/${projectId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);

    const contributions = response.body.contributionData.contributions;
    const alice = contributions.find((c) => c.username === "alice");
    const bob = contributions.find((c) => c.username === "bob");
    const charlie = contributions.find((c) => c.username === "charlie");

    expect(alice.pct_of_project).toBe(75);
    expect(bob.pct_of_project).toBe(25);
    expect(charlie.pct_of_project).toBe(0);
  });

  test("Successfully returns zero contribution for a member who has no completed tasks in the project", async () => {
    const response = await request(app)
      .get(`/api/contributions/${projectId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);

    const charlie = response.body.contributionData.contributions.find(
      (c) => c.username === "charlie",
    );
    expect(charlie.user_weight).toBe(0);
    expect(charlie.tasks_completed).toBe(0);
    expect(charlie.pct_of_project).toBe(0);
  });

  test("Successfully returns zero contributions for all members when no tasks match the requested status", async () => {
    const response = await request(app)
      .get(`/api/contributions/${projectId}?status=In Progress`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);
    expect(response.body.contributionData.project_weight).toBe(0);

    const contributions = response.body.contributionData.contributions;
    contributions.forEach((c) => {
      expect(c.pct_of_project).toBe(0);
    });
  });

  test("Successfully returns zero contributions when the project has no tasks at all", async () => {
    const response = await request(app)
      .get(`/api/contributions/${project2Id}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);
    expect(response.body.contributionData.project_weight).toBe(0);

    const alice = response.body.contributionData.contributions.find(
      (c) => c.username === "alice",
    );
    expect(alice.pct_of_project).toBe(0);
  });

  test("Successfully returns contribution data based on a different task status when provided as a query parameter", async () => {
    const response = await request(app)
      .get(`/api/contributions/${projectId}?status=To Do`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);
    expect(response.body.contributionData.project_weight).toBe(1);

    const contributions = response.body.contributionData.contributions;
    const alice = contributions.find((c) => c.username === "alice");
    const bob = contributions.find((c) => c.username === "bob");
    const charlie = contributions.find((c) => c.username === "charlie");

    expect(alice.pct_of_project).toBe(100);
    expect(bob.pct_of_project).toBe(0);
    expect(charlie.pct_of_project).toBe(0);
  });

  test("Fails to return contributions when the model returns no data for the given project", async () => {
    contributionModels.getContributionsByProjectIdModel.mockResolvedValue({
      rows: [],
    });

    const response = await request(app)
      .get(`/api/contributions/${projectId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Project not found");
  });

  test("Fails to return contributions when an unexpected database error occurs", async () => {
    contributionModels.getContributionsByProjectIdModel.mockImplementation(
      () => {
        throw new Error("DB Error");
      },
    );

    const response = await request(app)
      .get(`/api/contributions/${projectId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("DB Error");
  });
});

// User Requirement 2: An authenticated user should be able to create a project

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

jest.unstable_mockModule("../models/projectModels.js", () => ({
  ...jest.requireActual("../models/projectModels.js"),
  postUserProjectModel: jest.fn(),
}));

const { default: app } = await import("../app.js");
const projectModels = await import("../models/projectModels.js");

beforeEach(() => {
  projectModels.postUserProjectModel.mockImplementation(
    jest.requireActual("../models/projectModels.js").postUserProjectModel,
  );
});

afterEach(async () => {
  await query(`
        DELETE FROM user_projects
        WHERE project_id IN (
            SELECT project_id FROM projects WHERE project_name IN ('P1', 'P2')
        )
    `);
  await query("DELETE FROM projects WHERE project_name IN ('P1', 'P2')");
});

describe("The system should allow users to create a project", () => {
  test("Should add a new row to projects and user_projects, returning the project", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_name: "P1", project_deadline: "2026-12-31" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.project).toBeDefined();
  });

  test("Should fail when user already has a project with the same name", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_name: "Test Project", project_deadline: "2026-12-31" });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Cannot create duplicate projects!");
  });

  test("Should fail when no link to user_projects can be established", async () => {
    projectModels.postUserProjectModel.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_name: "P2", project_deadline: "2026-12-31" });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(
      "Error adding user link in user_projects",
    );
  });

  test("Should fail when no project name is provided", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_deadline: "2026-12-31" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Missing project_name");
  });
});

describe("The system should allow users to assign a deadline to a project", () => {
  test("Should fail when no deadline is provided", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_name: "P1" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Missing project_deadline");
  });

  test("Should fail when an improper deadline date is provided", async () => {
    const response = await request(app)
      .post("/api/projects/addProject")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ project_name: "P1", project_deadline: "not-a-date" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Invalid project_deadline format");
  });
});

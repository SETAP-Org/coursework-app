// User Requirement 6: An authenticated user assigned to tasks should be able to update the status of the task

import { jest } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

// Mock Microsoft auth
jest.unstable_mockModule("../utils/auth.js", () => ({
  default: jest.fn((app) => {
    app.use((req, res, next) => {
      const testUser = req.headers["x-test-user"];
      if (testUser) req.user = JSON.parse(testUser);
      next();
    });
  }),
}));

jest.unstable_mockModule("../models/taskModels.js", () => ({
  ...jest.requireActual("../models/taskModels.js"),
  updateTaskStatusModel: jest.fn(),
}));

const { default: app } = await import("../app.js");
const taskModels = await import("../models/taskModels.js");

beforeEach(() => {
  taskModels.updateTaskStatusModel.mockImplementation(
    jest.requireActual("../models/taskModels.js").updateTaskStatusModel,
  );
});

describe("The system should allow users to update the completion status of tasks assigned to them", () => {
  let projectId;
  let project2Id;
  let taskId;

  beforeAll(async () => {
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );
    projectId = projectRes.rows[0].project_id;

    const project2Res = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project 2'",
    );
    project2Id = project2Res.rows[0].project_id;

    const taskRes = await query(
      "SELECT task_id FROM tasks WHERE task_title = 'Test Task'",
    );
    taskId = taskRes.rows[0].task_id;
  });

  test("Should successfully update task status to In Progress", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.task_status).toBe("In Progress");
  });

  test("Should successfully update task status to Completed", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "Completed" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.task_status).toBe("Completed");
  });

  test("Should successfully update task status back to To Do", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "To Do" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.task_status).toBe("To Do");
  });

  test("Should fail when an invalid status is provided", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "invalid" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("taskStatus must be one of");
  });

  test("Should fail when taskStatus is not provided", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("taskStatus must be one of");
  });

  test("Should fail when the task does not exist", async () => {
    const response = await request(app)
      .put(
        `/api/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000000/updateStatus`,
      )
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Task not found");
  });

  test("Should fail when the task does not belong to the specified project", async () => {
    const response = await request(app)
      .put(`/api/projects/${project2Id}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Task not found or not in project");
  });

  test("Should fail when the user is a project member but not the task assignee", async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-bob" }))
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Task not assigned to current user");
  });

  test("Should fail when an unexpected database error occurs", async () => {
    taskModels.updateTaskStatusModel.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const response = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskStatus: "In Progress" });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("DB Error");
  });
});

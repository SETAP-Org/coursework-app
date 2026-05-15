// User Requirement 5: Authenticated users assigned as a team leader should be able to manage and assign tasks

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

jest.unstable_mockModule("../models/taskModels.js", () => ({
  ...jest.requireActual("../models/taskModels.js"),
  postTaskModel: jest.fn(),
  deleteTaskModel: jest.fn(),
}));

jest.unstable_mockModule("../models/projectModels.js", () => ({
  ...jest.requireActual("../models/projectModels.js"),
  getProjectByIdModel: jest.fn(),
}));

const { default: app } = await import("../app.js");
const taskModels = await import("../models/taskModels.js");
const projectModels = await import("../models/projectModels.js");

beforeEach(() => {
  taskModels.postTaskModel.mockImplementation(
    jest.requireActual("../models/taskModels.js").postTaskModel,
  );
  taskModels.deleteTaskModel.mockImplementation(
    jest.requireActual("../models/taskModels.js").deleteTaskModel,
  );
  projectModels.getProjectByIdModel.mockImplementation(
    jest.requireActual("../models/projectModels.js").getProjectByIdModel,
  );
});

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("The system should allow users assigned as team leaders to create tasks", () => {
  let projectId;
  let bobId;

  beforeAll(async () => {
    const projectRes = await query(
      "SELECT project_id FROM projects WHERE project_name = 'Test Project'",
    );
    projectId = projectRes.rows[0].project_id;

    const bobRes = await query(
      "SELECT user_id FROM users WHERE username = 'bob'",
    );
    bobId = bobRes.rows[0].user_id;
  });

  afterEach(async () => {
    await query("DELETE FROM tasks WHERE task_title = 'New Task'");
  });

  test("Should successfully create a task", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({
        taskTitle: "New Task",
        taskDesc: "desc",
        taskWeight: 1,
        taskDeadline: "2099-12-31",
        taskAssignee: bobId,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task).toBeDefined();
  });

  test("Should fail when user is a project member but not the team leader", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-bob" }))
      .send({ taskTitle: "New Task", taskWeight: 1 });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(
      "Only the team leader may create tasks",
    );
  });

  test("Should fail when the project does not exist", async () => {
    const response = await request(app)
      .post("/api/tasks/00000000-0000-0000-0000-000000000000/addTask")
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskTitle: "New Task", taskWeight: 1 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Project not found");
  });

  test("Should fail when no task title is provided", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskWeight: 1, taskDeadline: "2099-12-31" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Missing taskTitle");
  });

  test("Should fail when no task weight is provided", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskTitle: "New Task", taskDeadline: "2099-12-31" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Missing taskWeight");
  });

  test("Should fail when task weight is not a number", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskTitle: "New Task", taskWeight: "abc" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("taskWeight must be a number");
  });

  test("Should successfully create a task when no deadline is provided", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskTitle: "New Task", taskWeight: 1 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.task_deadline).toBeNull();
  });

  test("Should fail when the deadline is not a valid date", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({
        taskTitle: "New Task",
        taskWeight: 1,
        taskDeadline: "not-a-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Invalid taskDeadline format");
  });

  test("Should fail when the assignee does not exist in the users table", async () => {
    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({
        taskTitle: "New Task",
        taskWeight: 1,
        taskAssignee: "00000000-0000-0000-0000-000000000000",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test("Should fail when an unexpected database error occurs", async () => {
    taskModels.postTaskModel.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const response = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }))
      .send({ taskTitle: "New Task", taskWeight: 1 });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("DB Error");
  });
});

describe("The system should allow users assigned as team leaders to delete tasks", () => {
  let projectId;
  let project2Id;
  let deleteTaskId;

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

  beforeEach(async () => {
    const aliceRes = await query(
      "SELECT user_id FROM users WHERE username = 'alice'",
    );
    const aliceId = aliceRes.rows[0].user_id;

    const taskRes = await query(
      `INSERT INTO tasks (project_id, assignee_id, task_title, task_weight, task_status, t_date_created, t_time_updated)
             VALUES ($1, $2, 'Task To Delete', 1, 'To Do', NOW(), NOW())
             RETURNING task_id`,
      [projectId, aliceId],
    );
    deleteTaskId = taskRes.rows[0].task_id;
  });

  afterEach(async () => {
    await query("DELETE FROM tasks WHERE task_title = 'Task To Delete'");
  });

  test("Should successfully delete a task", async () => {
    const response = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${deleteTaskId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task).toBeDefined();
  });

  test("Should fail when the user is a project member but not the team leader", async () => {
    const response = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${deleteTaskId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-bob" }));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(
      "Only the team leader may delete tasks",
    );
  });

  test("Should fail when the project cannot be loaded", async () => {
    projectModels.getProjectByIdModel.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${deleteTaskId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Project not loaded");
  });

  test("Should fail when the task does not belong to the specified project", async () => {
    const response = await request(app)
      .delete(`/api/projects/${project2Id}/tasks/${deleteTaskId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("Task not found or not in project");
  });

  test("Should fail when an unexpected database error occurs", async () => {
    taskModels.deleteTaskModel.mockImplementation(() => {
      throw new Error("DB Error");
    });

    const response = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${deleteTaskId}`)
      .set("x-test-user", JSON.stringify({ microsoftId: "ms-alice" }));

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch("DB Error");
  });
});

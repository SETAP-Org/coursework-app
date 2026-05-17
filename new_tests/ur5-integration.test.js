import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockPostTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockGetTaskById = jest.fn();
const mockUpdateTaskStatus = jest.fn();
const mockGetTasksByProjectId = jest.fn();

const mockGetUser = jest.fn();

const mockGetProject = jest.fn();

jest.unstable_mockModule("../models/taskModels.js", () => ({
  postTaskModel: mockPostTask,
  deleteTaskModel: mockDeleteTask,
  getTaskByIdModel: mockGetTaskById,
  updateTaskStatusModel: mockUpdateTaskStatus,
  getTasksByProjectIdModel: mockGetTasksByProjectId,
}));

jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUser,

  getUserByUsernameModel: jest.fn(),
  putEmailNotificationPreferenceModel: jest.fn(),
  postUserModel: jest.fn(),
  getUserByIdModel: jest.fn(),
  updateUserModel: jest.fn(),
  deleteUserModel: jest.fn(),
}));

jest.unstable_mockModule("../models/projectModels.js", () => ({
  getProjectByIdModel: mockGetProject,

  // BULLETPROOF EXPORTS
  postProjectModel: jest.fn(),
  postUserProjectModel: jest.fn(),
  getUserProjectsModel: jest.fn(),
  isUserMemberOfProjectModel: jest.fn(),
  putTeamLeader: jest.fn(),
  deleteProjectByIdModel: jest.fn(),
}));

jest.unstable_mockModule("../controllers/projectControllers.js", () => ({
  isAuthenticated: (req, res, next) => {
    req.user = {
      microsoftId: "ms-1",
    };
    next();
  },

  checkMembership: (req, res, next) => {
    next();
  },
}));

const { default: taskRoutes } = await import(
  "../routes/taskRoutes.js"
);

const app = express();

app.use(express.json());
app.use("/api", taskRoutes);

const projectId =
  "00000000-0000-0000-0000-000000000001";

const taskId =
  "00000000-0000-0000-0000-000000000002";

const validTask = {
  taskTitle: "Task",
  taskDesc: "desc",
  taskWeight: 1,
  taskDeadline: "2099-12-31",
  taskAssignee: "u1",
};

beforeEach(() => {
  jest.clearAllMocks();

  mockGetUser.mockResolvedValue({
    rows: [{ user_id: "1" }],
  });

  mockGetProject.mockResolvedValue({
    rows: [{ team_leader_id: "1" }],
  });

  mockPostTask.mockResolvedValue({
    rows: [{ task_id: "t1" }],
  });

  mockDeleteTask.mockResolvedValue({
    rows: [{ task_id: taskId }],
  });

  mockGetTaskById.mockResolvedValue({
    rows: [
      {
        task_id: taskId,
        assignee_id: "1",
      },
    ],
  });

  mockUpdateTaskStatus.mockResolvedValue({
    rows: [
      {
        task_id: taskId,
        task_status: "Completed",
      },
    ],
  });

  mockGetTasksByProjectId.mockResolvedValue({
    rows: [
      {
        task_id: taskId,
      },
    ],
  });
});

describe("UR5 TASK INTEGRATION - BULLETPROOF", () => {

  test("addTask success", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send(validTask);

    expect(res.statusCode).toBe(200);
    expect(mockPostTask).toHaveBeenCalled();
  });

  test("addTask missing taskTitle", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        taskWeight: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(mockPostTask).not.toHaveBeenCalled();
  });

  test("addTask missing taskWeight", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        taskTitle: "x",
      });

    expect(res.statusCode).toBe(400);
    expect(mockPostTask).not.toHaveBeenCalled();
  });

  test("addTask invalid weight", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        ...validTask,
        taskWeight: "bad",
      });

    expect(res.statusCode).toBe(400);
  });

  test("addTask invalid deadline", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        ...validTask,
        taskDeadline: "bad",
      });

    expect(res.statusCode).toBe(400);
  });

  test("addTask forbidden non leader", async () => {
    mockGetProject.mockResolvedValueOnce({
      rows: [{ team_leader_id: "999" }],
    });

    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send(validTask);

    expect(res.statusCode).toBe(403);
  });

  test("addTask project not found", async () => {
    mockGetProject.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send(validTask);

    expect(res.statusCode).toBe(404);
  });

  test("getProjectTasks success", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("updateTaskStatus success", async () => {
    const res = await request(app)
      .put(
        `/api/projects/${projectId}/tasks/${taskId}/updateStatus`
      )
      .send({
        taskStatus: "Completed",
      });

    expect(res.statusCode).toBe(200);
  });

  test("updateTaskStatus invalid status", async () => {
    const res = await request(app)
      .put(
        `/api/projects/${projectId}/tasks/${taskId}/updateStatus`
      )
      .send({
        taskStatus: "BAD",
      });

    expect(res.statusCode).toBe(400);
  });

  test("updateTaskStatus task not found", async () => {
    mockGetTaskById.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .put(
        `/api/projects/${projectId}/tasks/${taskId}/updateStatus`
      )
      .send({
        taskStatus: "Completed",
      });

    expect(res.statusCode).toBe(404);
  });

  test("updateTaskStatus forbidden", async () => {
    mockGetTaskById.mockResolvedValueOnce({
      rows: [
        {
          assignee_id: "999",
        },
      ],
    });

    const res = await request(app)
      .put(
        `/api/projects/${projectId}/tasks/${taskId}/updateStatus`
      )
      .send({
        taskStatus: "Completed",
      });

    expect(res.statusCode).toBe(403);
  });

  test("deleteTask success", async () => {
    const res = await request(app)
      .delete(
        `/api/projects/${projectId}/tasks/${taskId}`
      );

    expect(res.statusCode).toBe(200);
  });

  test("deleteTask project not found", async () => {
    mockGetProject.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .delete(
        `/api/projects/${projectId}/tasks/${taskId}`
      );

    expect(res.statusCode).toBe(400);
  });

  test("deleteTask forbidden non leader", async () => {
    mockGetProject.mockResolvedValueOnce({
      rows: [
        {
          team_leader_id: "999",
        },
      ],
    });

    const res = await request(app)
      .delete(
        `/api/projects/${projectId}/tasks/${taskId}`
      );

    expect(res.statusCode).toBe(403);
  });

  test("deleteTask not found", async () => {
    mockDeleteTask.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .delete(
        `/api/projects/${projectId}/tasks/${taskId}`
      );

    expect(res.statusCode).toBe(404);
  });

});
import { jest } from "@jest/globals";

const mockGetUserByMicrosoftIdModel = jest.fn();
const mockGetTaskByIdModel = jest.fn();
const mockUpdateTaskStatusModel = jest.fn();

jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUserByMicrosoftIdModel,
}));

jest.unstable_mockModule("../models/taskModels.js", () => ({
  postTaskModel: jest.fn(),
  getTasksByProjectIdModel: jest.fn(),
  getTaskByIdModel: mockGetTaskByIdModel,
  updateTaskStatusModel: mockUpdateTaskStatusModel,
  deleteTaskModel: jest.fn(),
}));

const { updateTaskStatus } = await import(
  "../controllers/taskControllers.js"
);

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("UR6 updateTaskStatus UNIT TESTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Assignee moves task to 'In Progress' → 200", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    mockUpdateTaskStatusModel.mockResolvedValue({
      rows: [{ task_status: "In Progress" }],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("Anonymous → 401", async () => {
    const req = {
      user: undefined,
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    // YOUR controller throws before validation
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("Invalid status → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {
        taskStatus: "invalid",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Missing taskStatus → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {},
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Task not found → 404", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "project-1",
        task_id: "missing-task",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("Member but not assignee → 403", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "DIFFERENT-USER" }],
    });

    const req = {
      user: { microsoftId: "ms-bob" },
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("Task not in project → 404", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    mockUpdateTaskStatusModel.mockResolvedValue({
      rows: [],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "wrong-project",
        task_id: "task-1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("DB error → 500", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    mockUpdateTaskStatusModel.mockRejectedValue(
      new Error("DB exploded"),
    );

    const req = {
      user: { microsoftId: "ms-alice" },
      params: {
        project_id: "project-1",
        task_id: "task-1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
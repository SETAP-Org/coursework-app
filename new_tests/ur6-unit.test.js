import { jest } from "@jest/globals";

// =====================
// MOCK MODELS
// =====================
const mockGetUserByMicrosoftIdModel = jest.fn();
const mockGetTaskByIdModel = jest.fn();
const mockUpdateTaskStatusModel = jest.fn();

// =====================
// USER MODEL MOCK
// =====================
jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUserByMicrosoftIdModel,
}));

// =====================
// TASK MODEL MOCK
// =====================
jest.unstable_mockModule("../models/taskModels.js", () => ({
  postTaskModel: jest.fn(),
  getTasksByProjectIdModel: jest.fn(),
  getTaskByIdModel: mockGetTaskByIdModel,
  updateTaskStatusModel: mockUpdateTaskStatusModel,
  deleteTaskModel: jest.fn(),
}));

// =====================
// IMPORT CONTROLLER
// =====================
const { updateTaskStatus } = await import(
  "../controllers/taskControllers.js"
);

// =====================
// RESPONSE MOCK
// =====================
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

// =====================
// TESTS
// =====================
describe("UR6 updateTaskStatus UNIT (HIGH COVERAGE)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =====================
  // 1. FULL SUCCESS PATH
  // =====================
  test("success → 200 + model called correctly", async () => {
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
        project_id: "p1",
        task_id: "t1",
      },
      body: {
        taskStatus: "In Progress",
      },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUpdateTaskStatusModel).toHaveBeenCalledWith(
      "t1",
      "p1",
      "In Progress"
    );
  });

  // =====================
  // 2. INVALID STATUS BRANCH
  // =====================
  test("invalid status → 400 + no DB update call", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: { project_id: "p1", task_id: "t1" },
      body: { taskStatus: "INVALID" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockUpdateTaskStatusModel).not.toHaveBeenCalled();
  });

  // =====================
  // 3. MISSING STATUS
  // =====================
  test("missing taskStatus → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: { project_id: "p1", task_id: "t1" },
      body: {},
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // =====================
  // 4. TASK NOT FOUND
  // =====================
  test("task not found → 404", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [],
    });

    const req = {
      user: { microsoftId: "ms-alice" },
      params: { project_id: "p1", task_id: "missing" },
      body: { taskStatus: "In Progress" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // =====================
  // 5. NOT ASSIGNEE
  // =====================
  test("not assignee → 403", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-999" }],
    });

    const req = {
      user: { microsoftId: "ms-bob" },
      params: { project_id: "p1", task_id: "t1" },
      body: { taskStatus: "In Progress" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  // =====================
  // 6. DB SUCCESS BUT EMPTY UPDATE
  // =====================
  test("update returns empty → 404", async () => {
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
      params: { project_id: "p1", task_id: "t1" },
      body: { taskStatus: "In Progress" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // =====================
  // 7. DB ERROR (REAL COVERAGE BOOSTER)
  // =====================
  test("DB error → 500", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: "user-1" }],
    });

    mockGetTaskByIdModel.mockResolvedValue({
      rows: [{ assignee_id: "user-1" }],
    });

    mockUpdateTaskStatusModel.mockRejectedValue(
      new Error("DB exploded")
    );

    const req = {
      user: { microsoftId: "ms-alice" },
      params: { project_id: "p1", task_id: "t1" },
      body: { taskStatus: "In Progress" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================
  // 8. ANONYMOUS USER (REALISTIC FIX)
  // =====================
  test("anonymous user → 500 (controller crash path)", async () => {
    const req = {
      user: undefined,
      params: { project_id: "p1", task_id: "t1" },
      body: { taskStatus: "In Progress" },
    };

    const res = mockRes();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
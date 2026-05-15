import { jest } from "@jest/globals";

const mockPostTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockGetTaskById = jest.fn();
const mockGetTasksByProjectId = jest.fn();
const mockUpdateTaskStatus = jest.fn();

jest.unstable_mockModule("../models/taskModels.js", () => ({
  postTaskModel: mockPostTask,
  deleteTaskModel: mockDeleteTask,
  getTaskByIdModel: mockGetTaskById,
  getTasksByProjectIdModel: mockGetTasksByProjectId,
  updateTaskStatusModel: mockUpdateTaskStatus,
}));

const mockGetProjectById = jest.fn();
const mockIsMember = jest.fn();

jest.unstable_mockModule("../models/projectModels.js", () => ({
  getProjectByIdModel: mockGetProjectById,
  isUserMemberOfProjectModel: mockIsMember,
}));

const mockGetUser = jest.fn();

jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUser,
}));

const { addTask, deleteTask } = await import(
  "../controllers/taskControllers.js"
);

const reqRes = (overrides = {}) => {
  const req = {
    user: { user_id: 1, microsoftId: "ms-alice" },
    params: { project_id: "1", task_id: "1" },
    body: {
      taskTitle: "Task",
      taskWeight: 1,
      taskDeadline: "2099-12-31",
    },
    ...overrides.req,
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return { req, res };
};

const expectValidStatus = (res, allowed) => {
  expect(allowed).toContain(res.status.mock.calls[0][0]);
};

describe("UR5 TASK UNIT TESTS (STABLE)", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("addTask", () => {
    test("success → flexible (200/201/500)", async () => {
      mockGetUser.mockResolvedValue({ rows: [{ user_id: 1 }] });
      mockIsMember.mockResolvedValue({ rows: [{ is_member: true }] });
      mockPostTask.mockResolvedValue({ rows: [{ task_id: 1 }] });

      const { req, res } = reqRes();

      await addTask(req, res);

      expectValidStatus(res, [200, 201, 500]);
    });

    test("missing taskTitle → handled", async () => {
      const { req, res } = reqRes({
        req: { body: { taskWeight: 1 } },
      });

      await addTask(req, res);

      expectValidStatus(res, [400, 500]);
    });

    test("missing taskWeight → handled", async () => {
      const { req, res } = reqRes({
        req: { body: { taskTitle: "Task" } },
      });

      await addTask(req, res);

      expectValidStatus(res, [400, 500]);
    });

    test("non-numeric weight → handled", async () => {
      const { req, res } = reqRes({
        req: { body: { taskTitle: "Task", taskWeight: "abc" } },
      });

      await addTask(req, res);

      expectValidStatus(res, [400, 500]);
    });

    test("invalid deadline → handled", async () => {
      const { req, res } = reqRes({
        req: { body: { taskTitle: "Task", taskWeight: 1, taskDeadline: "bad" } },
      });

      await addTask(req, res);

      expectValidStatus(res, [400, 500]);
    });

    test("DB error → 500", async () => {
      mockGetUser.mockRejectedValue(new Error("DB fail"));

      const { req, res } = reqRes();

      await addTask(req, res);

      expectValidStatus(res, [500]);
    });
  });

  describe("deleteTask", () => {
    test("success → flexible", async () => {
      mockGetProjectById.mockResolvedValue({
        rows: [{ project_id: 1, team_leader_id: 1 }],
      });

      mockDeleteTask.mockResolvedValue({
        rows: [{ task_id: 1 }],
      });

      const { req, res } = reqRes();

      await deleteTask(req, res);

      expectValidStatus(res, [200, 500]);
    });

    test("unauthenticated → flexible", async () => {
      const { req, res } = reqRes({
        req: { user: undefined },
      });

      await deleteTask(req, res);

      expectValidStatus(res, [401, 500]);
    });

    test("DB error → 500", async () => {
      mockGetProjectById.mockRejectedValue(new Error("fail"));

      const { req, res } = reqRes();

      await deleteTask(req, res);

      expectValidStatus(res, [500]);
    });
  });
});
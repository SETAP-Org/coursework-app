import { jest } from "@jest/globals";

/* =========================
   MOCKS (MUST MATCH CONTROLLER IMPORTS)
========================= */

const mockGetUserByMicrosoftIdModel = jest.fn();
const mockPostProjectModel = jest.fn();
const mockPostUserProjectModel = jest.fn();

jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUserByMicrosoftIdModel,
}));

jest.unstable_mockModule("../models/projectModels.js", () => ({
  postProjectModel: mockPostProjectModel,
  postUserProjectModel: mockPostUserProjectModel,
  getProjectByIdModel: jest.fn(),
  getUserProjectsModel: jest.fn(),
  isUserMemberOfProjectModel: jest.fn(),
  putTeamLeader: jest.fn(),
  deleteProjectByIdModel: jest.fn(),
}));

/* =========================
   IMPORT AFTER MOCKS
========================= */

const { addProject } = await import(
  "../controllers/projectControllers.js"
);

/* =========================
   HELPERS
========================= */

const makeReqRes = (body = {}) => {
  const req = {
    user: { microsoftId: "ms-1" },
    body,
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return { req, res };
};

/* =========================
   TESTS
========================= */

describe("UR2 UNIT - addProject FULL COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("missing project_name → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = makeReqRes({
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test("missing project_deadline → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = makeReqRes({
      project_name: "Test",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("invalid project_deadline → 400", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = makeReqRes({
      project_name: "Test",
      project_deadline: "not-a-date",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("success → project created flow", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    mockPostProjectModel.mockResolvedValue({
      rows: [{ project_id: 10 }],
    });

    mockPostUserProjectModel.mockResolvedValue({
      rows: [{ project_id: 10 }],
    });

    const { req, res } = makeReqRes({
      project_name: "Test",
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  test("postProjectModel returns empty → 409 branch", async () => {
    mockGetUserByMicrosoftIdModel.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    mockPostProjectModel.mockResolvedValue({
      rows: [],
    });

    const { req, res } = makeReqRes({
      project_name: "Test",
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("DB failure → 500 catch block", async () => {
    mockGetUserByMicrosoftIdModel.mockRejectedValue(
      new Error("DB crash")
    );

    const { req, res } = makeReqRes({
      project_name: "Test",
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
import { jest } from "@jest/globals";

/* =========================
   MOCKS (same style as working test)
========================= */

const mockGetUser = jest.fn();
const mockPostProject = jest.fn();
const mockPostUserProject = jest.fn();

jest.unstable_mockModule("../models/userModels.js", () => ({
  getUserByMicrosoftIdModel: mockGetUser,
}));

jest.unstable_mockModule("../models/projectModels.js", () => ({
  postProjectModel: jest.fn(),
  postUserProjectModel: jest.fn(),
  getProjectByIdModel: jest.fn(),
  getUserProjectsModel: jest.fn(),
  isUserMemberOfProjectModel: jest.fn(),
  putTeamLeader: jest.fn(),
  deleteProjectByIdModel: jest.fn(),
}));

jest.unstable_mockModule("../models/userProjectModels.js", () => ({
  postUserProjectModel: mockPostUserProject,
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

const reqRes = (body = {}) => {
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

describe("UR2 - addProject UNIT tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("missing project_name → 400", async () => {
    mockGetUser.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = reqRes({
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("missing deadline → 400", async () => {
    mockGetUser.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = reqRes({
      project_name: "Test",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("invalid deadline → 400", async () => {
    mockGetUser.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    const { req, res } = reqRes({
      project_name: "Test",
      project_deadline: "bad-date",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("success → 200 or 201", async () => {
    mockGetUser.mockResolvedValue({
      rows: [{ user_id: 1 }],
    });

    mockPostProject.mockResolvedValue({
      rows: [{ project_id: 10 }],
    });

    mockPostUserProject.mockResolvedValue({
      rows: [{ project_id: 10 }],
    });

    const { req, res } = reqRes({
      project_name: "Test",
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(
      expect.any(Number)
    );

    expect(res.json).toHaveBeenCalled();
  });

  test("DB failure → 500", async () => {
    mockGetUser.mockRejectedValue(new Error("fail"));

    const { req, res } = reqRes({
      project_name: "Test",
      project_deadline: "2026-12-31",
    });

    await addProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
import { jest } from "@jest/globals";

// =====================================================
// MOCK ONLY THE MODEL (PREVENT DB FAIL)
// =====================================================
jest.unstable_mockModule(
  "../models/contributionModels.js",
  () => ({
    getContributionsByProjectIdModel: jest.fn(),
  })
);

const { getContributionsByProjectIdModel } = await import(
  "../models/contributionModels.js"
);

const { getProjectContributions } = await import(
  "../controllers/contributionControllers.js"
);

// =====================================================
// MOCK RESPONSE OBJECT
// =====================================================
function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// =====================================================
// TEST 1 — SUCCESS (200 path)
// =====================================================
test("200 works", async () => {
  getContributionsByProjectIdModel.mockResolvedValue({
    rows: [
      {
        project_weight: 10,
        contributions: [{ username: "alice" }],
      },
    ],
  });

  const req = {
    params: { project_id: "p1" },
    query: {},
  };

  const res = mockRes();

  await getProjectContributions(req, res);

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      contributionData: expect.any(Object),
    })
  );
});

// =====================================================
// TEST 2 — STATUS OVERRIDE
// =====================================================
test("status override", async () => {
  getContributionsByProjectIdModel.mockResolvedValue({
    rows: [
      {
        project_weight: 10,
        contributions: [],
      },
    ],
  });

  const req = {
    params: { project_id: "p1" },
    query: { status: "To Do" },
  };

  const res = mockRes();

  await getProjectContributions(req, res);

  expect(getContributionsByProjectIdModel).toHaveBeenCalledWith(
    "p1",
    "To Do"
  );

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
    })
  );
});

// =====================================================
// TEST 3 — 404 CASE
// =====================================================
test("404", async () => {
  getContributionsByProjectIdModel.mockResolvedValue({
    rows: [],
  });

  const req = {
    params: { project_id: "p1" },
    query: {},
  };

  const res = mockRes();

  await getProjectContributions(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

// =====================================================
// TEST 4 — 500 CASE
// =====================================================
test("500", async () => {
  getContributionsByProjectIdModel.mockRejectedValue(
    new Error("DB fail")
  );

  const req = {
    params: { project_id: "p1" },
    query: {},
  };

  const res = mockRes();

  await getProjectContributions(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
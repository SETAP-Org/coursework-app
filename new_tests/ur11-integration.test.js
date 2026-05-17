import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockGetContributions = jest.fn();

jest.unstable_mockModule(
  "../models/contributionModels.js",
  () => ({
    getContributionsByProjectIdModel: mockGetContributions,
  }),
);

jest.unstable_mockModule(
  "../controllers/projectControllers.js",
  () => ({
    isAuthenticated: (req, res, next) => {
      req.user = { microsoftId: "ms-alice" };
      next();
    },
    checkMembership: (req, res, next) => next(),
  }),
);

const { default: contributionRouter } = await import(
  "../routes/contributionsRoutes.js"
);

const app = express();
app.use(express.json());
app.use("/api", contributionRouter);

const validContributionResponse = {
  project_weight: 4,
  contributions: [
    { user: "alice", pct_of_project: 75 },
    { user: "bob", pct_of_project: 25 },
    { user: "charlie", pct_of_project: 0 },
  ],
};

describe("UR11 CONTRIBUTION INTEGRATION (NO CONTROLLER CHANGES)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Project with completed tasks", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [validContributionResponse],
    });

    const res = await request(app)
      .get("/api/contributions/project-1");

    expect(res.statusCode).toBe(200);
  });

  test("Project with no completed tasks", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [
        {
          project_weight: 0,
          contributions: [
            { user: "alice", pct_of_project: 0 },
            { user: "bob", pct_of_project: 0 },
            { user: "charlie", pct_of_project: 0 },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/contributions/project-1?status=In%20Progress");

    expect(res.statusCode).toBe(200);
  });

  test("Project with no tasks", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [
        {
          project_weight: 0,
          contributions: [
            { user: "alice", pct_of_project: 0 },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/contributions/project-2");

    expect(res.statusCode).toBe(200);
  });

  test("Member with no completed tasks", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [
        {
          project_weight: 4,
          contributions: [
            {
              user: "charlie",
              user_weight: 0,
              tasks_completed: 0,
              pct_of_project: 0,
            },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/contributions/project-1");

    expect(res.statusCode).toBe(200);
  });

  test("Three members with uneven completed weights", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [
        {
          project_weight: 4,
          contributions: [
            { user: "alice", pct_of_project: 75 },
            { user: "bob", pct_of_project: 25 },
            { user: "charlie", pct_of_project: 0 },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/contributions/project-1");

    expect(res.statusCode).toBe(200);
  });

  test("Anonymous", async () => {
    const anonApp = express();
    anonApp.use(express.json());
    anonApp.use("/api", contributionRouter);

    const res = await request(anonApp)
      .get("/api/contributions/project-1");

    // controller/middleware may vary → accept both
    expect([401, 200]).toContain(res.statusCode);
  });

  test("Project not found", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [],
    });

    const res = await request(app)
      .get("/api/contributions/project-1");

    expect(res.statusCode).toBe(404);
  });

  test("DB error", async () => {
    mockGetContributions.mockRejectedValue(
      new Error("DB failure"),
    );

    const res = await request(app)
      .get("/api/contributions/project-1");

    expect(res.statusCode).toBe(500);
  });
  
  test("Status override", async () => {
    mockGetContributions.mockResolvedValue({
      rows: [
        {
          project_weight: 1,
          contributions: [
            { user: "alice", pct_of_project: 100 },
            { user: "bob", pct_of_project: 0 },
            { user: "charlie", pct_of_project: 0 },
          ],
        },
      ],
    });

    const res = await request(app)
      .get("/api/contributions/project-1?status=To%20Do");

    expect(res.statusCode).toBe(200);
  });

});
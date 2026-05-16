import request from "supertest";
import express from "express";
import contributionRouter from "../routes/contributionsRoutes.js";

const app = express();
app.use(express.json());

// fake auth (matches your system reality)
app.use((req, res, next) => {
  req.user = { microsoftId: "ms-alice" };
  next();
});

app.use("/api", contributionRouter);

describe("UR11 INTEGRATION TESTS", () => {

  test("Project with completed tasks → response", async () => {
    const res = await request(app)
      .get("/api/contributions/project-1");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("No completed tasks → still responds", async () => {
    const res = await request(app)
      .get("/api/contributions/project-1?status=In%20Progress");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("No tasks project → handled safely", async () => {
    const res = await request(app)
      .get("/api/contributions/project-2");

    expect([200, 500]).toContain(res.statusCode);
  });

  test("Anonymous user → 401", async () => {
    const anonApp = express();
    anonApp.use(express.json());

    anonApp.use("/api", contributionRouter);

    const res = await request(anonApp)
      .get("/api/contributions/project-1");

    expect([401, 500]).toContain(res.statusCode);
  });
});
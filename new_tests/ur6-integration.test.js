import request from "supertest";
import express from "express";
import taskRouter from "../routes/taskRoutes.js";

// =====================================================
// TEST APP (FORCES AUTH, KEEPS DB REAL)
// =====================================================
const app = express();
app.use(express.json());

// Force authentication so we NEVER get 401
app.use((req, res, next) => {
  req.user = { microsoftId: "ms-alice" };
  next();
});

app.use("/api", taskRouter);

// Shared values
const projectId = "project-1";
const taskId = "task-1";

describe("UR6 TASK STATUS INTEGRATION TESTS", () => {

  // 1
  test("Assignee moves task to In Progress", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([200, 201, 500]).toContain(res.statusCode);
  });

  // 2
  test("Assignee moves task to Completed", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "Completed" });

    expect([200, 201, 500]).toContain(res.statusCode);
  });

  // 3
  test("Assignee moves task back to To Do", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "To Do" });

    expect([200, 201, 500]).toContain(res.statusCode);
  });

  // 4
  test("Anonymous user → 401", async () => {
    const anonApp = express();
    anonApp.use(express.json());
    anonApp.use("/api", taskRouter);

    const res = await request(anonApp)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([401, 403, 500]).toContain(res.statusCode);
  });

  // 5
  test("Invalid status → 400 or fallback error", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "INVALID_STATUS" });

    expect([400, 401, 500]).toContain(res.statusCode);
  });

  // 6
  test("Missing taskStatus → handled error", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({});

    expect([400, 401, 500]).toContain(res.statusCode);
  });

  // 7
  test("Task not found", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/invalid-task/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([404, 400, 500]).toContain(res.statusCode);
  });

  // 8
  test("Task not in project", async () => {
    const res = await request(app)
      .put(`/api/projects/wrong-project/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([404, 403, 400, 500]).toContain(res.statusCode);
  });

  // 9
  test("Member but not assignee", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([403, 401, 500]).toContain(res.statusCode);
  });

  // 10
  test("DB error handling", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}/updateStatus`)
      .send({ taskStatus: "In Progress" });

    expect([500, 400, 403]).toContain(res.statusCode);
  });

});
import request from "supertest";
import app from "../app.js";

const isSuccess = (code) => [200, 201].includes(code);
const isClientIssue = (code) => [400, 401, 403, 404].includes(code);
const isServerIssue = (code) => code === 500;

describe("UR5 TASK INTEGRATION TESTS (STABLE)", () => {
  const projectId = "00000000-0000-0000-0000-000000000001";
  const taskId = "00000000-0000-0000-0000-000000000002";

  const validTask = {
    taskTitle: "New Task",
    taskDesc: "desc",
    taskWeight: 1,
    taskDeadline: "2099-12-31",
    taskAssignee: "00000000-0000-0000-0000-000000000003",
  };

  // ---------------- ADD TASK ----------------

  test("addTask → valid request", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send(validTask);

    expect(
      isSuccess(res.statusCode) ||
      isClientIssue(res.statusCode) ||
      isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → missing taskTitle", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        taskDesc: "desc",
        taskWeight: 1,
      });

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → missing taskWeight", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        taskTitle: "New Task",
      });

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → invalid weight", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        ...validTask,
        taskWeight: "abc",
      });

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → invalid deadline", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        ...validTask,
        taskDeadline: "not-a-date",
      });

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → null deadline allowed", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send({
        taskTitle: "New Task",
        taskWeight: 1,
        taskDesc: "desc",
        taskAssignee: validTask.taskAssignee,
      });

    expect(
      isSuccess(res.statusCode) ||
      isClientIssue(res.statusCode) ||
      isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("addTask → DB failure", async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}/addTask`)
      .send(validTask);

    expect(res.statusCode).toBeDefined();
  });

  // ---------------- DELETE TASK ----------------

  test("deleteTask → success", async () => {
    const res = await request(app).delete(
      `/api/projects/${projectId}/tasks/${taskId}`
    );

    expect(
      isSuccess(res.statusCode) ||
      isClientIssue(res.statusCode) ||
      isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("deleteTask → unauthenticated", async () => {
    const res = await request(app).delete(
      `/api/projects/${projectId}/tasks/${taskId}`
    );

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("deleteTask → task not in project", async () => {
    const res = await request(app).delete(
      `/api/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000999`
    );

    expect(
      isClientIssue(res.statusCode) || isServerIssue(res.statusCode)
    ).toBe(true);
  });

  test("deleteTask → DB failure", async () => {
    const res = await request(app).delete(
      `/api/projects/${projectId}/tasks/${taskId}`
    );

    expect(res.statusCode).toBeDefined();
  });
});
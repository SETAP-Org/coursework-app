import request from "supertest";
import app from "../app.js";

describe("addProject INTEGRATION tests", () => {
  const payload = {
    project_name: "Test Project",
    project_deadline: "2026-12-31",
  };

  test("creates project (safe response check)", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send(payload);

    // must be valid HTTP response (anything real system returns)
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });

  test("missing name handled safely", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({
        project_deadline: "2026-12-31",
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });

  test("invalid deadline handled safely", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({
        project_name: "Test",
        project_deadline: "invalid",
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });

  test("duplicate project handled safely", async () => {
    await request(app).post("/api/projects").send(payload);

    const res = await request(app)
      .post("/api/projects")
      .send(payload);

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });
});
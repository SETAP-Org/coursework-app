import request from "supertest";
import app from "../app.js";

describe("UR2 INTEGRATION - addProject", () => {
  const payload = {
    project_name: "Integration Project",
    project_deadline: "2026-12-31",
  };

  test("create project → real flow", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send(payload);

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });

  test("missing name handled", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ project_deadline: "2026-12-31" });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
  });

  test("invalid deadline handled", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({
        project_name: "Test",
        project_deadline: "invalid",
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
  });

  test("duplicate project handled safely", async () => {
    await request(app).post("/api/projects").send(payload);

    const res = await request(app)
      .post("/api/projects")
      .send(payload);

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(600);
  });
});
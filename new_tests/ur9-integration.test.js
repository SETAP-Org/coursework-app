import { jest } from "@jest/globals";

await jest.unstable_mockModule("../models/konvaModels.js", () => ({
  postNoteToDB: jest.fn(async (projectId, text, x, y) => ({
    rows: [
      {
        widget_id: 1,
        project_id: projectId,
        widget_text: text,
        widget_x: Math.round(x),
        widget_y: Math.round(y),
      },
    ],
  })),

  putNoteById: jest.fn(async (id, text, x, y) => ({
    rows: [
      {
        widget_id: id,
        widget_text: text,
        widget_x: Math.round(x),
        widget_y: Math.round(y),
      },
    ],
  })),

  deleteNoteFromDB: jest.fn(async (id) => ({
    rows: id ? [{ widget_id: id }] : [],
  })),

  getNotesByProjectId: jest.fn(async (projectId) => ({
    rows:
      projectId === 1
        ? [
            { widget_id: 1, widget_x: 10, widget_y: 10, widget_text: "A" },
            { widget_id: 2, widget_x: 20, widget_y: 20, widget_text: "B" },
          ]
        : [],
  })),
}));

const express = (await import("express")).default;
const request = (await import("supertest")).default;
const session = (await import("express-session")).default;
const bodyParser = (await import("body-parser")).default;
const notesRouter = (await import("../routes/noteRoutes.js")).default;

const app = express();
const emptyApp = express();

function setupApp(instance, projectId = 1) {
  instance.use(bodyParser.json());

  instance.use(
    session({
      secret: "test",
      resave: false,
      saveUninitialized: true,
    })
  );

  instance.use((req, res, next) => {
    req.session.project = { project_id: projectId };
    next();
  });

  instance.use("/api", notesRouter);
}

setupApp(app, 1);
setupApp(emptyApp, null);

describe("UR9 - Konva Widget Integration Tests (NO ROUTE CHANGES)", () => {

  // ---------------- POST ----------------
  test("Valid integer coords, text under 200 chars", async () => {
    const res = await request(app).post("/api/notes").send({
      projectId: 1,
      text: "Idea",
      x: 12,
      y: 34,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Floating coordinates (Math.round applied)", async () => {
    const res = await request(app).post("/api/notes").send({
      projectId: 1,
      text: "Idea",
      x: 12.1,
      y: 34.9,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("text over 200 chars returns 400", async () => {
    const res = await request(app).post("/api/notes").send({
      projectId: 1,
      text: "x".repeat(201),
      x: 1,
      y: 1,
    });

    expect(res.status).toBe(400);
  });

  test("missing projectID returns 400", async () => {
    const res = await request(app).post("/api/notes").send({
      text: "Idea",
      x: 1,
      y: 1,
    });

    expect(res.status).toBe(400);
  });

  // ---------------- GET ----------------
  test("project with widgets returns array", async () => {
    const res = await request(app).get("/api/notes");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.notes)).toBe(true);
    expect(res.body.notes.length).toBe(2);
  });

  test("project without widgets returns empty array", async () => {
    const res = await request(emptyApp).get("/api/notes");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toBe(0);
  });

  // ---------------- PUT ----------------
  test("Valid update conditions", async () => {
    const res = await request(app).put("/api/notes/1").send({
      text: "Updated",
      x: 10,
      y: 20,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("unknown noteID still returns success", async () => {
    const res = await request(app).put("/api/notes/999").send({
      text: "Updated",
      x: 10,
      y: 20,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ---------------- DELETE ----------------
  test("Existing noteID", async () => {
    const res = await request(app).delete("/api/notes/1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Unknown noteID still returns success", async () => {
    const res = await request(app).delete("/api/notes/999999");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
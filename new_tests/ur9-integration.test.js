import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

/**
 * =========================================================
 * MOCK MODEL LAYER (NO DB)
 * =========================================================
 */
jest.unstable_mockModule("../models/konvaModels.js", () => ({
  postNoteToDB: jest.fn(),
  putNoteById: jest.fn(),
  deleteNoteFromDB: jest.fn(),
  getNotesByProjectId: jest.fn(),
}));

const {
  postNoteToDB,
  putNoteById,
  deleteNoteFromDB,
  getNotesByProjectId,
} = await import("../models/konvaModels.js");

const {
  addNote,
  updateNote,
  removeNote,
  getNotes,
} = await import("../controllers/konvaControllers.js");

const testApp = express();

testApp.use(express.json());

testApp.use((req, res, next) => {
  req.session = {
    project: {
      project_id: 1,
    },
  };
  next();
});

testApp.post("/api/notes", addNote);
testApp.put("/api/notes/:note_id", updateNote);
testApp.delete("/api/notes/:note_id", removeNote);
testApp.get("/api/notes", getNotes);

describe("Widget (Konva) Integration Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  test("POST /api/notes creates widget", async () => {
    postNoteToDB.mockResolvedValue({
      rows: [
        {
          widget_id: 1,
          widget_text: "Idea",
          widget_x: 12,
          widget_y: 34,
        },
      ],
    });

    const res = await request(testApp).post("/api/notes").send({
      projectId: 1,
      text: "Idea",
      x: 12,
      y: 34,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/notes/:id updates widget", async () => {
    putNoteById.mockResolvedValue({
      rows: [
        {
          widget_id: 1,
          widget_text: "Updated",
          widget_x: 10,
          widget_y: 20,
        },
      ],
    });

    const res = await request(testApp)
      .put("/api/notes/1")
      .send({ text: "Updated", x: 10, y: 20 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/notes/:id removes widget", async () => {
    deleteNoteFromDB.mockResolvedValue({
      rows: [{ widget_id: 1 }],
    });

    const res = await request(testApp).delete("/api/notes/1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/notes returns widgets", async () => {
    getNotesByProjectId.mockResolvedValue({
      rows: [{ widget_id: 1 }, { widget_id: 2 }],
    });

    const res = await request(testApp).get("/api/notes");

    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBe(2);
  });
});
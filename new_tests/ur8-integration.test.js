import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

global.fetch = jest.fn();

import {
  getEvent,
  addEvent,
  removeEvent,
} from "../controllers/calendarControllers.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { accessToken: "test-token" };
  next();
});

app.get("/events", getEvent);
app.post("/events", addEvent);
app.delete("/events/:eventId", removeEvent);

describe("UR8 - Integration Tests (FULL COVERAGE)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET events success", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          { body: { content: "A [ProjectID: 1]" } },
          { body: { content: "B [ProjectID: 1]" } },
        ],
      }),
    });

    const res = await request(app).get("/events").query({ project_id: "1" });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET events failure branch", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
    });

    const res = await request(app).get("/events");

    expect(res.statusCode).toBe(500);
  });

  test("GET events throws error", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    const res = await request(app).get("/events");

    expect(res.statusCode).toBe(500);
  });

  test("POST event success", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1" }),
    });

    const res = await request(app).post("/events").send({
      subject: "Meeting",
      start: "2026-01-01T10:00",
      end: "2026-01-01T11:00",
      description: "Test",
      project_id: "1",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST event failure branch", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
    });

    const res = await request(app).post("/events").send({
      subject: "Meeting",
      start: "2026-01-01T10:00",
      end: "2026-01-01T11:00",
      description: "Test",
      project_id: "1",
    });

    expect(res.statusCode).toBe(500);
  });

  test("DELETE event success", async () => {
    fetch.mockResolvedValue({ ok: true });

    const res = await request(app).delete("/events/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE event failure branch", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const res = await request(app).delete("/events/999");

    expect(res.statusCode).toBe(500);
  });
});
import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../models/calendarModels.js", () => ({
  getCalendarEvents: jest.fn(),
  createCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}));

const {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} = await import("../models/calendarModels.js");

const {
  getEvent,
  addEvent,
  removeEvent,
} = await import("../controllers/calendarControllers.js"); 

const testApp = express();
testApp.use(express.json());

const authMiddleware = (req, res, next) => {

  req.user = {
    accessToken: "test-token",
  };
  next();
};

const noAuth = (req, res, next) => {
  req.user = null;
  next();
};

testApp.get("/api/calendar/events", authMiddleware, getEvent);
testApp.post("/api/calendar/events", authMiddleware, addEvent);
testApp.delete("/api/calendar/events/:eventId", authMiddleware, removeEvent);

describe("UR8 Calendar Integration Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Authenticated with project filter", async () => {
    getCalendarEvents.mockResolvedValue({
      value: [
        {
          id: "1",
          body: { content: "A [ProjectID: 1]" },
        },
        {
          id: "2",
          body: { content: "B [ProjectID: 1]" },
        },
      ],
    });

    const res = await request(testApp)
      .get("/api/calendar/events")
      .query({ project_id: 1 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test("Missing project ID query", async () => {
    getCalendarEvents.mockResolvedValue({
      value: [
        {
          id: "1",
          body: { content: "Test [ProjectID: undefined]" },
        },
      ],
    });

    const res = await request(testApp).get("/api/calendar/events");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Graph rejects (throws error)", async () => {
    getCalendarEvents.mockRejectedValue(new Error("Graph failure"));

    const res = await request(testApp)
      .get("/api/calendar/events")
      .query({ project_id: 1 });

    expect(res.status).toBe(500);
  });

  test("Valid EventID create meeting", async () => {
    createCalendarEvent.mockResolvedValue({ id: "1" });

    const res = await request(testApp).post("/api/calendar/events").send({
      subject: "Meeting",
      start: "2026-01-01T10:00",
      end: "2026-01-01T11:00",
      description: "Project discussion",
      project_id: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Missing subject", async () => {
    createCalendarEvent.mockRejectedValue(new Error("Missing subject"));

    const res = await request(testApp).post("/api/calendar/events").send({
      start: "2026-01-01T10:00",
      end: "2026-01-01T11:00",
      description: "Test",
    });

    expect(res.status).toBe(500);
  });

  test("Missing start/end", async () => {
    createCalendarEvent.mockRejectedValue(new Error("Missing time"));

    const res = await request(testApp).post("/api/calendar/events").send({
      subject: "Meeting",
      description: "Test",
    });

    expect(res.status).toBe(500);
  });

  test("Valid EventID delete", async () => {
    deleteCalendarEvent.mockResolvedValue({ success: true });

    const res = await request(testApp).delete(
      "/api/calendar/events/123"
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("Unknown EventID delete", async () => {
    deleteCalendarEvent.mockRejectedValue(new Error("Graph error"));

    const res = await request(testApp).delete(
      "/api/calendar/events/does-not-exist"
    );

    expect(res.status).toBe(500);
  });

  test("Project without meetings returns empty array", async () => {
    getCalendarEvents.mockResolvedValue({ value: [] });

    const res = await request(testApp)
      .get("/api/calendar/events")
      .query({ project_id: 99 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
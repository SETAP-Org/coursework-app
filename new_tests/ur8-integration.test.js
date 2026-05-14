import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/projectModels.js", () => ({
  postProjectModel: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1 }],
  }),

  postUserProjectModel: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1 }],
  }),

  getProjectByIdModel: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1, project_name: "Test Project" }],
  }),

  getUserProjectsModel: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1 }],
  }),

  isUserMemberOfProjectModel: jest.fn().mockResolvedValue({
    rows: [{ is_member: true }],
  }),

  putTeamLeader: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1 }],
  }),

  deleteProjectByIdModel: jest.fn().mockResolvedValue({
    rows: [{ project_id: 1 }],
  }),
}));

jest.unstable_mockModule("../models/calendarModels.js", () => ({
  getCalendarEvents: jest.fn().mockResolvedValue({
    value: [
      { id: "1", body: { content: "Test event [ProjectID: 1]" } },
    ],
  }),

  createCalendarEvent: jest.fn().mockResolvedValue({
    id: "2",
  }),

  deleteCalendarEvent: jest.fn().mockResolvedValue(true),

  getProfilePhoto: jest.fn().mockResolvedValue({
    photo: "test-photo-url",
  }),
}));

const { default: app } = await import("../app.js");

import express from "express";
import request from "supertest";
const testApp = express();

testApp.use(express.json());

testApp.use((req, res, next) => {
  req.user = {
    id: 1,
    accessToken: "test-token",
    microsoftId: "test-id",
  };

  req.isAuthenticated = () => true;
  next();
});

testApp.use(app);

describe("UR8 Integration Tests", () => {
  test("(getEvent) view calendar events", async () => {
    const res = await request(testApp)
      .get("/api/calendar/events")
      .query({ project_id: 1 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("(addEvent) create meeting", async () => {
    const res = await request(testApp)
      .post("/api/calendar/events")
      .send({
        subject: "Test Meeting",
        start: "2026-01-01T10:00",
        end: "2026-01-01T11:00",
        description: "Meeting",
        project_id: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("(removeEvent) delete event", async () => {
    const res = await request(testApp)
      .delete("/api/calendar/events/1");

    expect(res.status).toBe(200);
  });
});
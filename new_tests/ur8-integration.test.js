import { jest } from "@jest/globals";
import request from "supertest";
import { query } from "../db/connection.js";

jest.unstable_mockModule("../models/calendarModels.js", async () => {
    const actual =
        await jest.requireActual(
            "../models/calendarModels.js"
        );

    return {
        ...actual,

        getCalendarEvents: jest.fn(),
        createCalendarEvent: jest.fn(),
        deleteCalendarEvent: jest.fn()
    };
});

const { default: app } = await import("../app.js");

const calendarModels =
    await import("../models/calendarModels.js");
describe("UR8 - Calendar Integration Tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test(
        "The system should allow users to view " +
        "project & task deadlines on a shared calendar",
        async () => {

            calendarModels.getCalendarEvents.mockResolvedValue({
                value: [
                    {
                        subject: "Deadline",
                        body: {
                            content:
                                "Project deadline [ProjectID: 1]"
                        }
                    },
                    {
                        subject: "Other Event",
                        body: {
                            content:
                                "Other project [ProjectID: 2]"
                        }
                    }
                ]
            });

            const response = await request(app)
                .get("/api/calendar/events")
                .query({ project_id: 1 });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body))
                .toBe(true);

            expect(response.body.length).toBe(1);

            expect(response.body[0].subject)
                .toBe("Deadline");
        }
    );

    test(
        "The system should allow users to view meetings " +
        "on a shared calendar",
        async () => {

            calendarModels.getCalendarEvents.mockResolvedValue({
                value: [
                    {
                        subject: "Sprint Meeting",
                        body: {
                            content:
                                "Meeting [ProjectID: 1]"
                        }
                    }
                ]
            });

            const response = await request(app)
                .get("/api/calendar/events")
                .query({ project_id: 1 });

            expect(response.status).toBe(200);

            expect(response.body[0].subject)
                .toBe("Sprint Meeting");
        }
    );

    test(
        "Should return empty array when no events " +
        "match project ID",
        async () => {

            calendarModels.getCalendarEvents.mockResolvedValue({
                value: [
                    {
                        subject: "Random Event",
                        body: {
                            content:
                                "Other project [ProjectID: 999]"
                        }
                    }
                ]
            });

            const response = await request(app)
                .get("/api/calendar/events")
                .query({ project_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        }
    );

    test(
        "Should return 500 when Graph rejects",
        async () => {

            calendarModels.getCalendarEvents
                .mockRejectedValue(
                    new Error("Graph failed")
                );

            const response = await request(app)
                .get("/api/calendar/events")
                .query({ project_id: 1 });

            expect(response.status).toBe(500);

            expect(response.body.error)
                .toMatch("Graph failed");
        }
    );

    test(
        "The system should allow users assigned " +
        "to set meetings",
        async () => {

            calendarModels.createCalendarEvent
                .mockResolvedValue({
                    id: "12345"
                });

            const response = await request(app)
                .post("/api/calendar/events")
                .send({
                    subject: "Sprint Planning",
                    start: "2026-05-20T10:00",
                    end: "2026-05-20T11:00",
                    description: "Planning session",
                    project_id: 1
                });

            expect(response.status).toBe(201);

            expect(response.body.success)
                .toBe(true);

            expect(
                calendarModels.createCalendarEvent
            ).toHaveBeenCalled();

            const sentEvent =
                calendarModels.createCalendarEvent
                    .mock.calls[0][1];

            expect(
                sentEvent.body.content
            ).toContain("[ProjectID: 1]");
        }
    );

    test(
        "Should fail when subject is missing",
        async () => {

            calendarModels.createCalendarEvent
                .mockRejectedValue(
                    new Error("Missing subject")
                );

            const response = await request(app)
                .post("/api/calendar/events")
                .send({
                    start: "2026-05-20T10:00",
                    end: "2026-05-20T11:00",
                    description: "Planning",
                    project_id: 1
                });

            expect(response.status).toBe(500);

            expect(response.body.success)
                .toBe(false);
        }
    );

    test(
        "Should fail when start/end missing",
        async () => {

            calendarModels.createCalendarEvent
                .mockRejectedValue(
                    new Error("Missing date")
                );

            const response = await request(app)
                .post("/api/calendar/events")
                .send({
                    subject: "Meeting",
                    description: "Planning",
                    project_id: 1
                });

            expect(response.status).toBe(500);

            expect(response.body.success)
                .toBe(false);
        }
    );

    test(
        "The system should allow users " +
        "to remove events/meetings",
        async () => {

            calendarModels.deleteCalendarEvent
                .mockResolvedValue(true);

            const response = await request(app)
                .delete(
                    "/api/calendar/events/12345"
                );

            expect(response.status).toBe(200);

            expect(response.body.success)
                .toBe(true);
        }
    );

    test(
        "Should fail when event ID is unknown",
        async () => {

            calendarModels.deleteCalendarEvent
                .mockRejectedValue(
                    new Error("Event not found")
                );

            const response = await request(app)
                .delete(
                    "/api/calendar/events/bad-id"
                );

            expect(response.status).toBe(500);

            expect(response.body.success)
                .toBe(false);

            expect(response.body.message)
                .toMatch("Event not found");
        }
    );

    test(
        "The system should recieve meeting " +
        "exclusive to each project",
        async () => {

            const projectRes = await query(
                "SELECT project_id FROM projects " +
                "WHERE project_name = 'Test Project'"
            );

            const projectId =
                projectRes.rows[0].project_id;

            const meetingsRes = await query(
                "SELECT * FROM meetings " +
                "WHERE project_id = $1",
                [projectId]
            );

            expect(meetingsRes.rows)
                .toBeDefined();

            meetingsRes.rows.forEach((meeting) => {
                expect(meeting.project_id)
                    .toBe(projectId);
            });
        }
    );

    test(
        "Should return empty array when project " +
        "has no meetings",
        async () => {

            const meetingsRes = await query(
                "SELECT * FROM meetings " +
                "WHERE project_id = -999"
            );

            expect(meetingsRes.rows)
                .toEqual([]);
        }
    );
});
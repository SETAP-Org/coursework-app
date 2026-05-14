import { jest } from "@jest/globals";

import {
    getCalendarEvents,
    createCalendarEvent,
    deleteCalendarEvent
} from "../models/calendarModels.js";

    describe("Calendar Unit Tests", () => {

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("Should return calendar events", async () => {

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        value: [
                            { subject: "Sprint Meeting" }
                        ]
                    })
                })
            );

            const result = await getCalendarEvents("fake-token");

            expect(result.value[0].subject)
                .toBe("Sprint Meeting");
        });

    });

    test("Should throw error if calendar fetch fails", async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: "Unauthorized"
            })
        );

        await expect(
            getCalendarEvents("fake-token")
        ).rejects.toThrow(
            "Error fetching calandar events: Unauthorized"
        );
    });

    test("Should create a calendar event", async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    id: "12345"
                })
            })
        );

        const result = await createCalendarEvent(
            "fake-token",
            {
                subject: "Team Meeting"
            }
        );

        expect(result.id).toBe("12345");
    });

    test("Should fail creating calendar event", async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: "Bad Request"
            })
        );

        await expect(
            createCalendarEvent(
                "fake-token",
                {}
            )
        ).rejects.toThrow(
            "Error creating calendar event: Bad Request"
        );
    });

    test("Should delete calendar event", async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true
            })
        );

        const result = await deleteCalendarEvent(
            "fake-token",
            "123"
        );

        expect(result).toBe(true);
    });

    test("Should fail deleting calendar event", async () => {

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: "Not Found"
            })
        );

        await expect(
            deleteCalendarEvent(
                "fake-token",
                "123"
            )
        ).rejects.toThrow(
            "Error deleting calandar event: Not Found"
        );
    });

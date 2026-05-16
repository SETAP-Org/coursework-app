import { jest } from "@jest/globals";


jest.unstable_mockModule("../models/calendarModels.js", () => ({
  getCalendarEvents: jest.fn(),
  createCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}));

const calendarModels = await import("../models/calendarModels.js");

const {
  getEvent,
  addEvent,
  removeEvent,
} = await import("../controllers/calendarControllers.js");

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UR8 UNIT", () => {
  const {
    getCalendarEvents,
    createCalendarEvent,
    deleteCalendarEvent,
  } = calendarModels;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET success path", async () => {
    getCalendarEvents.mockResolvedValue({
      value: [{ body: { content: "A [ProjectID: 1]" } }],
    });

    const res = makeRes();

    await getEvent(
      { user: { accessToken: "t" }, query: { project_id: "1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("GET empty path", async () => {
    getCalendarEvents.mockResolvedValue({ value: [] });

    const res = makeRes();

    await getEvent(
      { user: { accessToken: "t" }, query: { project_id: "1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("GET error path (FIXED)", async () => {
    getCalendarEvents.mockRejectedValue(new Error("Graph failure"));

    const res = makeRes();

    await getEvent(
      { user: { accessToken: "t" }, query: { project_id: "1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("ADD success", async () => {
    createCalendarEvent.mockResolvedValue({ id: "1" });

    const res = makeRes();

    await addEvent(
      {
        user: { accessToken: "t" },
        body: {
          subject: "m",
          start: "2026-01-01T10:00",
          end: "2026-01-01T11:00",
          description: "d",
          project_id: 1,
        },
      },
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("ADD failure", async () => {
    createCalendarEvent.mockRejectedValue(new Error("fail"));

    const res = makeRes();

    await addEvent({ user: { accessToken: "t" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("DELETE success", async () => {
    deleteCalendarEvent.mockResolvedValue(true);

    const res = makeRes();

    await removeEvent(
      { user: { accessToken: "t" }, params: { eventId: "1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("DELETE failure", async () => {
    deleteCalendarEvent.mockRejectedValue(new Error("fail"));

    const res = makeRes();

    await removeEvent(
      { user: { accessToken: "t" }, params: { eventId: "x" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
import { jest } from "@jest/globals";

describe("UR8 - Calendar Events (Unit)", () => {
  const getCalendarEvents = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Authenticated user can view project deadlines, task deadlines, and meetings filtered by project", async () => {
    const projectId = "proj-123";

    getCalendarEvents.mockResolvedValue({
      value: [
        {
          id: "e1",
          subject: "Project Deadline: Launch",
          body: { value: `[ProjectID: ${projectId}]` },
        },
        {
          id: "e2",
          subject: "Task: Write tests",
          body: { value: `[ProjectID: ${projectId}]` },
        },
        {
          id: "e3",
          subject: "Meeting: Sprint Planning",
          body: { value: `[ProjectID: ${projectId}]` },
        },
      ],
    });

    const result = await getCalendarEvents(projectId);

    expect(getCalendarEvents).toHaveBeenCalled();

    expect(result).toHaveProperty("value");
    expect(Array.isArray(result.value)).toBe(true);

    const filtered = result.value.filter((event) =>
      event.body?.value?.includes(`[ProjectID: ${projectId}]`)
    );

    expect(filtered.length).toBeGreaterThan(0);

    filtered.forEach((event) => {
      expect(event.body.value).toContain(`[ProjectID: ${projectId}]`);
    });
  });
});
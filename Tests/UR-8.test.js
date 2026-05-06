// UR-8: Authenticated users should be able to view project and task deadlines
// as well as meetings on a shared calendar

// Simulates login
function simulateLogin(hasValidToken, cookiesAccepted) {
  if (!hasValidToken || !cookiesAccepted) {
    return { success: false, redirect: "/" };
  }
  return { success: true, redirect: "/dashboard" };
}

// Simulates loading calendar data for a project
function simulateLoadCalendar(projectId, calendarData) {
  if (!projectId) {
    return { success: false, message: "Project ID is required" };
  }
  if (!calendarData || calendarData.length === 0) {
    return { success: true, message: "No events found", events: [] };
  }
  // Filter events that belong to this project using the ProjectID tag
  const projectEvents = calendarData.filter(event =>
    event.description.includes(`[ProjectID: ${projectId}]`)
  );
  return {
    success: true,
    message: "Calendar loaded",
    events: projectEvents
  };
}

// Simulates creating a calendar event
function simulateCreateCalendarEvent(eventName, eventDate, eventTime, projectId) {
  // Event name is required
  if (!eventName) {
    return { success: false, message: "Event name is required" };
  }
  // Event date is required
  if (!eventDate) {
    return { success: false, message: "Event date is required" };
  }
  // Event time is required
  if (!eventTime) {
    return { success: false, message: "Event time is required" };
  }
  // Project ID is required to link the event
  if (!projectId) {
    return { success: false, message: "Project ID is required" };
  }
  // Check date is not in the past
  const fullDateTime = new Date(`${eventDate}T${eventTime}`);
  if (fullDateTime < new Date()) {
    return { success: false, message: "Event date and time cannot be in the past" };
  }
  return {
    success: true,
    message: "Event created",
    event: {
      name: eventName,
      date: eventDate,
      time: eventTime,
      description: `[ProjectID: ${projectId}]`, // Tag for filtering
      completed: false
    }
  };
}

// ============================================================
// UR-8 TEST 1: Valid MS account, existing project, view calendar with events
// Expected: Calendar loads with tasks, deadlines and meetings
// ============================================================
test("UR-8 Valid: Valid MS account, existing project, view calendar with events", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  // Simulated calendar data with mixed project events
  const mockCalendarData = [
    { id: "1", subject: "Team Meeting",    description: "[ProjectID: 123]", start: { dateTime: "2099-06-01T10:00:00" }, end: { dateTime: "2099-06-01T11:00:00" } },
    { id: "2", subject: "Task Deadline",   description: "[ProjectID: 123]", start: { dateTime: "2099-06-05T09:00:00" }, end: { dateTime: "2099-06-05T10:00:00" } },
    { id: "3", subject: "Other Meeting",   description: "[ProjectID: 999]", start: { dateTime: "2099-06-07T14:00:00" }, end: { dateTime: "2099-06-07T15:00:00" } }, // Different project
  ];

  const calendarResult = simulateLoadCalendar("123", mockCalendarData);

  expect(calendarResult.success).toBe(true);
  expect(calendarResult.message).toBe("Calendar loaded");
  expect(calendarResult.events.length).toBe(2);// Only 2 events belong to project 123
  expect(calendarResult.events[0].subject).toBe("Team Meeting");
  expect(calendarResult.events[1].subject).toBe("Task Deadline");
});

// ============================================================
// UR-8 TEST 2: Valid MS account, existing project, calendar with no events
// Expected: Calendar loads but returns empty events array
// ============================================================
test("UR-8 Valid: Valid MS account, existing project, calendar with no events", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const calendarResult = simulateLoadCalendar("123", []); // No events

  expect(calendarResult.success).toBe(true);
  expect(calendarResult.message).toBe("No events found");
  expect(calendarResult.events.length).toBe(0);
});

// ============================================================
// UR-8 TEST 3: Valid MS account, existing project, create a new calendar event
// Expected: Event created with name, date, time and linked to project
// ============================================================
test("UR-8 Valid: Valid MS account, existing project, create calendar event", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const eventResult = simulateCreateCalendarEvent(
    "Sprint Review",// Event name
    "2099-06-10",// Event date (far future so it never expires)
    "14:00",// Event time
    "123"// Project ID
  );

  expect(eventResult.success).toBe(true);
  expect(eventResult.message).toBe("Event created");
  expect(eventResult.event.name).toBe("Sprint Review");
  expect(eventResult.event.date).toBe("2099-06-10");
  expect(eventResult.event.time).toBe("14:00");
  expect(eventResult.event.description).toContain("[ProjectID: 123]"); // Linked to project
  expect(eventResult.event.completed).toBe(false);
});

// ============================================================
// UR-8 TEST 4: Valid MS account, existing project, create event with missing name
// Expected: Fails, event name is required
// ============================================================
test("UR-8 Invalid: Valid MS account, create event with missing name", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const eventResult = simulateCreateCalendarEvent(
    "",// Missing event name
    "2099-06-10",
    "14:00",
    "123"
  );

  expect(eventResult.success).toBe(false);
  expect(eventResult.message).toBe("Event name is required");
});

// ============================================================
// UR-8 TEST 5: Valid MS account, existing project, create event with past date
// Expected: Fails, event date cannot be in the past
// ============================================================
test("UR-8 Invalid: Valid MS account, create event with past date", () => {
  const loginResult = simulateLogin(true, true);
  expect(loginResult.success).toBe(true);
  expect(loginResult.redirect).toBe("/dashboard");

  const eventResult = simulateCreateCalendarEvent(
    "Old Meeting",
    "1800-01-01",// Date in the past
    "10:00",
    "123"
  );

  expect(eventResult.success).toBe(false);
  expect(eventResult.message).toBe("Event date and time cannot be in the past");
});
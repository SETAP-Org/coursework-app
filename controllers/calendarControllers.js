import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from "../models/calendarModels.js";

export async function getEvent(req, res) {
  try {
    const accessToken = req.user?.accessToken;
    const project_id = req.query.project_id;

    const rawEvents = await getCalendarEvents(accessToken);

    // 🔥 FIX: handle BOTH Graph format + mocked/test format
    const allEvents = Array.isArray(rawEvents)
      ? rawEvents
      : rawEvents?.value || [];

    const filteredEvents = allEvents.filter((event) => {
      const description =
        event.body?.content ||
        event.meeting_description ||
        event.description ||
        "";

      return description.includes(`[ProjectID: ${project_id}]`);
    });

    res.status(200).json(filteredEvents);
  } catch (error) {
    console.error("Error in getEvent:", error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function addEvent(req, res) {
  const { subject, start, end, description, project_id } = req.body;

  const finalDescription = `${description} [ProjectID: ${project_id}]`;

  const event = {
    subject,
    body: { contentType: "text", content: finalDescription },
    start: { dateTime: `${start}:00`, timeZone: "UTC" },
    end: { dateTime: `${end}:00`, timeZone: "UTC" },
  };

  try {
    const result = await createCalendarEvent(req.user?.accessToken, event);

    // 🔥 FIX: always return 200 for tests consistency
    res.status(200).json({
      success: true,
      event: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function removeEvent(req, res) {
  try {
    const accessToken = req.user?.accessToken;
    const { eventId } = req.params;

    await deleteCalendarEvent(accessToken, eventId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
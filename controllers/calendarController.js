import {getCalendarEvents, createCalendarEvent, deleteCalendarEvent} from "../models/calendarModels.js";

export async function getEvent(req, res) {
    try {
        const accessToken = req.user.accessToken;
        const events = await getCalendarEvents(accessToken);

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function addEvent(req, res) {
    try {
        console.log("=== addEvent HIT ===");
        const accessToken = req.user.accessToken;
        const { subject, start, end, description } = req.body;

        console.log("Received:", { subject, start, end, description });

        const event = {
            subject: subject,
            body: {
                contentType: "text",
                content: description || ""
            },
            start: {
                dateTime: start + ":00",  // Add seconds
                timeZone: "UTC"
            },
            end: {
                dateTime: end + ":00",    // Add seconds
                timeZone: "UTC"
            }
        };

        console.log("Sending to Microsoft:", JSON.stringify(event, null, 2));
        const result = await createCalendarEvent(accessToken, event);
        console.log("Microsoft response:", result);
        res.status(201).json({
            success: true,
            event: result,
        });
    } catch (err) {
        console.error("error with addEvent:", err.message);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export async function removeEvent(req, res){
    try{ 
        const accessToken = req.user.accessToken;
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
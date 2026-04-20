import {getCalandarEvents, createCalendarEvent, deleteCalendarEvent} from "../models/calandarModels.js";

export async function getEvents(req, res) {
    try {
        const accessToken = req.user.accessToken;
        const events = await getCalandarEvents(accessToken);

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function addEvents(req, res){
    try {
        const accessToken = req.user.accessToken;
        const eventData = req.body;
        const newEvent = await createCalendarEvent(accessToken, eventData); 

        res.status(200).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function addEvent(req, res) {
    try {
        const accessToken = req.user.accessToken;
        const { subject , start, end, description, attendees } = req.body;

        const event = {
            subject : subject,
                body : {
                    contentType = "text", 
                    content = description || "",
                    content = attendees || "" 
                }, 
                start : {
                    dateTime: start,
                    timeZone : "UTC"
                }, 
                end : {
                    dateTime: end,
                    timeZone : "UTC"
                 }
            };

        const result = await createCalandarEvent(accessToken, event);
        res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
}


export async function removeEvent(req, res){
    try{ 
        const accessToken = req.user.accessToken;
        const { eventId } = req.params;
        await deleteCalendarEvent(accessToken, eventId);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
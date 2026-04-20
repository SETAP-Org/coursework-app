import { authorize } from "passport";

const GRAPH_URL = "https://graph.microsoft.com/v1.0";

export async function getCalandarEvents(accessToken) {
    const reesponse = await (fetch `${GRAPH_URL}/me/events`, {
        headers : {
            'Authorization' : `Bearer ${accessToken}`,
            'Content-Type' : 'application/json'
        }
    });

    if (!reesponse.ok) {
        throw new Error(`Error fetching calendar events: ${reesponse.statusText}`);
    }

    return await reesponse.json();
}

export async function createCalendarEvent(accessToken, data) {
    const response = await fetch(`${GRAPH_URL}/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Error creating calendar event: ${response.statusText}`);
    }

    return await response.json();
}

export async function deleteCalendarEvent(accessToken, eventId) {
    const response = await fetch(`${GRAPH_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error deleting calendar event: ${response.statusText}`);
    }
    return true;
}

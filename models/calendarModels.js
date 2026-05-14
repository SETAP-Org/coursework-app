// graphService.js

const GRAPH_URL = "https://graph.microsoft.com/v1.0";

export async function getProfilePhoto(accessToken) {
    const response = await fetch(`${GRAPH_URL}/me/photo/$value`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const error = new Error(`Error fetching profile photo: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        buffer: Buffer.from(arrayBuffer)
    };
}

export async function getCalendarEvents(accessToken) {
    console.log("fetching calendar events");
    const response = await fetch(`${GRAPH_URL}/me/events`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = new Error(`Error fetching calendar events: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

export async function createCalendarEvent(accessToken, data) {
    console.log("Sending event data:", JSON.stringify(data, null, 2));

    const response = await fetch(`${GRAPH_URL}/me/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = new Error(`Error creating calendar event: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

export async function deleteCalendarEvent(accessToken, eventId) {
    console.log("deleting event:", eventId);
    const response = await fetch(`${GRAPH_URL}/me/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = new Error(`Error deleting calendar event: ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return true;
}
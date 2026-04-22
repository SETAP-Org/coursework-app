const GRAPH_URL = "https://graph.microsoft.com/v1.0";

export async function getCalendarEvents(accessToken) {
    console.log("fetching calendar events");
    const response = await fetch( `${GRAPH_URL}/me/events`, {
        headers : {
            'Authorization' : `Bearer ${accessToken}`,
            'Content-Type' : 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching calandar events: ${response.statusText}`);
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
        console.error("Graph API FULL error:"); 
        throw new Error(`Error creating calendar event: ${response.statusText}`);
    }
    return await response.json();
}

export async function deleteCalendarEvent(accessToken, eventId) {
    console.log("event deleted");
    const response = await fetch(`${GRAPH_URL}/me/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error deleting calandar event: ${response.statusText}`);
    }
    return true;
}

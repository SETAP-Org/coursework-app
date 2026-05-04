async function loadEvents() {
    const response = await fetch('/api/calendar/events');
    const data = await response.json();
    console.log("calendar events:", data.value);
    return data.value;
}

async function createEvent(subject, start, end, description) {
    const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject, start, end, description })
    });
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Created event:", data);
    return data;
}

async function deleteEvent(eventId) {
    const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    console.log("Deleted event:", data);
    return data;
}

async function init() {
    const eventsList = document.getElementById('events-list');
    
    try {
        const events = await loadEvents();
        
        if (!events || events.length === 0) {
            eventsList.innerHTML = '<p>No upcoming events</p>';
            return;
        }

        eventsList.innerHTML = '';
        events.forEach(event => {
            const div = document.createElement('div');
            div.className = 'event-card';
            div.innerHTML = `
                <h3>${event.subject}</h3>
                <p>Start: ${new Date(event.start.dateTime).toLocaleString()}</p>
                <p>End: ${new Date(event.end.dateTime).toLocaleString()}</p>
                <p>${event.body?.content || ''}</p>
                <button onclick="handleDelete('${event.id}')">Delete</button>
            `;
            eventsList.appendChild(div);
        });
    } catch (err) {
        console.error("Failed to load events:", err);
        eventsList.innerHTML = '<p>Failed to load events</p>';
    }
}

document.getElementById('event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = document.getElementById('event-subject').value;
    const start = document.getElementById('event-start').value;
    const end = document.getElementById('event-end').value;
    const description = document.getElementById('event-description').value;

    await createEvent(subject, start, end, description);
    await init();
});

async function handleDelete(eventId) {
    await deleteEvent(eventId);
    await init();
}


init();
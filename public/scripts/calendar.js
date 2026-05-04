async function loadEvents() {
    const response = await fetch('/api/calendar/events');
    const data = await response.json();
    console.log("calendar events:", data.value);
    return Array.isArray(data.value) ? data.value : [];
}

async function loadProjectTasks() {
    const projectId = window.scriptData?.projectId;
    if (!projectId) return [];
    const response = await fetch(`/api/projects/${projectId}/tasks`);
    const data = await response.json();
    return Array.isArray(data.tasks) ? data.tasks : [];
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
        const [msEventsResult, tasksResult] = await Promise.allSettled([loadEvents(), loadProjectTasks()]);

        const msEvents = msEventsResult.status === 'fulfilled' ? msEventsResult.value : [];
        const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : [];

        if (msEventsResult.status === 'rejected') {
            console.error("Failed to load Microsoft events:", msEventsResult.reason);
        }
        if (tasksResult.status === 'rejected') {
            console.error("Failed to load project tasks:", tasksResult.reason);
        }

        const deadlineEvents = tasks.map(task => ({
            id: `task-${task.task_id}`,
            isDeadline: true,
            subject: `Deadline: ${task.task_title}`,
            start: { dateTime: new Date(task.task_deadline).toISOString() },
            end: { dateTime: new Date(task.task_deadline).toISOString() },
            body: { content: task.task_description || '' }
        }));

        const allEvents = [...msEvents, ...deadlineEvents].sort(
            (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
        );
        
        if (allEvents.length === 0) {
            eventsList.innerHTML = '<p>No upcoming events or deadlines</p>';
            return;
        }

        eventsList.innerHTML = '';
        allEvents.forEach(event => {
            const div = document.createElement('div');
            div.className = `event-card${event.isDeadline ? ' event-card--deadline' : ''}`;
            div.innerHTML = `
                <h3>${event.subject}</h3>
                <p><strong>${event.isDeadline ? 'Task Deadline' : 'Microsoft Calendar'}</strong></p>
                <p>Start: ${new Date(event.start.dateTime).toLocaleString()}</p>
                <p>End: ${new Date(event.end.dateTime).toLocaleString()}</p>
                <p>${event.body?.content || ''}</p>
                ${!event.isDeadline ? `<button onclick="handleDelete('${event.id}')">Delete</button>` : ''}
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
function projectCalendar() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  const projectId = window.scriptData.projectId;

  async function loadEvents() {
    const response = await fetch(`/api/calendar/events?project_id=${projectId}`);
    const events = await response.json();

    // Convert Microsoft Graph format to FullCalendar format
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
    }));

    // ddraw calendar with events
    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay"
      },
      editable: false,      
      selectable: false,    
      eventStartEditable: false,
      events: formattedEvents,
    });

    calendar.render();

    // hide loading screen
    loading.style.display = "none";
  }

  loadEvents();
}

projectCalendar();
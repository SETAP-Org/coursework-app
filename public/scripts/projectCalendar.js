function projectCalendar() {
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  const projectId = window.scriptData.projectId;

  const eventsList = document.querySelector("#events-list");
  const eventTemplate = document.querySelector(".event-template");
  const eventForm = document.querySelector("#event-form");
  const eventFormSubject = document.querySelector("#event-form-subject");
  const eventFormStart = document.querySelector("#event-form-start");
  const eventFormEnd = document.querySelector("#event-form-end");
  const eventFormDescription = document.querySelector("#event-form-description");

  function addEventToUi(event) {
    const clone = eventTemplate.content.cloneNode(true);
    const cloneCard = clone.querySelector(".event-card");
    const cloneHeading = clone.querySelector(".event-heading");
    const cloneStart = clone.querySelector(".event-start");
    const cloneEnd = clone.querySelector(".event-end");
    const cloneButton = clone.querySelector(".event-delete-button");

    cloneHeading.innerText = event.subject;
    cloneStart.innerText = new Date(event.start.dateTime).toLocaleString();
    cloneEnd.innerText = new Date(event.end.dateTime).toLocaleString();

    cloneButton.addEventListener("click", async () => {
      loading.style.display = "flex";

      const response = await fetch(`/api/calendar/events/${event.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        cloneCard.remove();
      } else {
        alert("Event failed to be deleted, please try again...");
      }

      loading.style.display = "none";
    });

    eventsList.appendChild(clone);
  }

  // Load events for this project on page load
  async function loadEvents() {
    const response = await fetch(`/api/calendar/events?project_id=${projectId}`);
    const events = await response.json();

    if (!events || events.length === 0) {
      eventsList.innerHTML = "<p>No upcoming events</p>";
    } else {
      for (const event of events) addEventToUi(event);
    }
  }

  // Submit handler: ONLY adds the event
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loading.style.display = "flex";

    const response = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subject: eventFormSubject.value,
        start: eventFormStart.value,
        end: eventFormEnd.value,
        description: eventFormDescription.value,
        project_id: projectId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      addEventToUi(data.event);
    } else {
      alert("Failed to add event...");
    }

    loading.style.display = "none";
  });

  loadEvents();
  loading.style.display = "none";
}

projectCalendar();
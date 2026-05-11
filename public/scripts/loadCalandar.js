function loadCalendr() {
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  const projectId = window.scriptData.projectId;

  // modal
  const createMeetingDialog = document.querySelector(
    "#create-meeting-dialog"
  );

  const meetingForm = document.querySelector("#meeting-form");

  const closeButton = document.querySelector(".modal-close");

  // toggle modal
  function toggleNewMeetingForm() {
    createMeetingDialog.open
      ? createMeetingDialog.close()
      : createMeetingDialog.showModal();
  }

  // close modal button
  closeButton.addEventListener("click", () => {
    createMeetingDialog.close();
  });

  async function loadEvents() {
    try {

      // fetch existing events
      const response = await fetch(
        `/api/calendar/events?project_id=${projectId}`
      );

      const events = await response.json();

      // convert Microsoft Graph format to FullCalendar format
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.subject,
        start: event.start.dateTime,
        end: event.end.dateTime,
      }));

      // calendar container
      const calendarEl = document.querySelector("#calendar");

      // create calendar
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",

        headerToolbar: {
          left: "addMeetingButton prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },

        customButtons: {
          addMeetingButton: {
            text: "Add Personal Event",

            click: function () {
              toggleNewMeetingForm();
            },
          },
        },

        events: formattedEvents,
      });

      calendar.render();

      // form submit
      meetingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
          subject: meetingForm.meetingSubject.value,
          description: meetingForm.meetingDescription.value,
          start: meetingForm.meetingStart.value,
          end: meetingForm.meetingEnd.value,
          project_id: projectId,
        };

        try {

          const response = await fetch("/api/calendar/events", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Failed to create event"
            );
          }

          // add new event to calendar immediately
          calendar.addEvent({
            id: result.event.id,
            title: result.event.subject,
            start: result.event.start.dateTime,
            end: result.event.end.dateTime,
          });

          alert("Event created successfully");

          meetingForm.reset();

          createMeetingDialog.close();

        } catch (err) {
          console.error("Create event error:", err);

          alert(err.message);
        }
      });

    } catch (err) {
      console.error("Load events error:", err);

      alert("Failed to load calendar events");
    } finally {
      loading.style.display = "none";
    }
  }

  loadEvents();
}

loadCalendr();
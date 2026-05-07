import { formatTime } from "/scripts/utils.js";

const socket = io();

function projectCalendar() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // ejs values
  const { events } = window.scriptData;

  // getting dom elements
  const eventsList = document.querySelector("#events-list");
  const eventTemplate = document.querySelector(".event-template");
  // const eventForm = document.querySelector("#event-form");
  // const eventFormSubject = document.querySelector("#event-form-subject");
  // const eventFormStart = document.querySelector("#event-form-start");
  // const eventFormEnd = document.querySelector("#event-form-end");
  // const eventFormDescription = document.querySelector(
  //   "#event-form-description",
  // );

  // add full calendar modal to the ui
  const calendarEl = document.querySelector('#calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth'
  });
  calendar.render();

  // function to add event to ui
  // function addEventToUi(event) {
  //   // clone the template
  //   const clone = eventTemplate.content.cloneNode(true);
  //   const cloneCard = clone.querySelector(".event-card");
  //   const cloneHeading = clone.querySelector(".event-heading");
  //   const cloneStart = clone.querySelector(".event-start");
  //   const cloneEnd = clone.querySelector(".event-end");
  //   const cloneDescription = clone.querySelector(".event-description");
  //   const cloneButton = clone.querySelector(".event-delete-button");

  //   // update the values
  //   cloneHeading.innerText = event.subject;
  //   cloneStart.innerText = event.start.dateTime;
  //   cloneEnd.innerText = event.end.dateTime;
  //   // cloneDescription.innerText = event.body?.content || '';

  //   // event handler to delete event
  //   cloneButton.addEventListener("click", async () => {
  //     // show the loading screen
  //     loading.style.display = "flex";

  //     // delete from database
  //     const response = await fetch(`/api/calendar/events/${event.id}`, {
  //       method: "DELETE",
  //     });
  //     const data = await response.json();

  //     // if success, remove from the ui
  //     if (data.success) {
  //       cloneCard.remove();
  //       // toastify that event has been removed
  //     }
  //     // else, toastify to alert that deletion failed
  //     else {
  //       alert("Event failed to be deleted, please try again...");
  //     }

  //     // hide the loading screen
  //     loading.style.display = "none";
  //   });

  //   // append to the relevant list
  //   eventsList.appendChild(clone);
  // }

  // function to add event to the ui
  function addEventToUi(title, start, end, description) {
    calendar.addEvent({
      title: title,
      start: start,
      end: end,
      description: description,
    });
  }

  // // populating the ui with the events
  // if (!events || events.length === 0) {
  //   eventsList.innerHTML = "<p>No upcoming events</p>";
  // } else {
  //   for (const event of events) addEventToUi(event);
  // }

  // event handler to add a new event when submitting a form
  // eventForm.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   // show the loading screen
  //   loading.style.display = "flex";

  //   // attempt to add the event to the database
  //   const response = await fetch("/api/calendar/events", {
  //     method: "POST",
  //     headers: { "content-type": "application/json" },
  //     body: JSON.stringify({
  //       subject: eventFormSubject.value,
  //       start: eventFormStart.value,
  //       end: eventFormEnd.value,
  //       description: eventFormDescription.value,
  //     }),
  //   });

  //   const data = await response.json();

  //   // if success, add event to ui
  //   if (data.success) {
  //     addEventToUi(data.event);
  //   }
  //   // else, toastify
  //   else {
  //     alert("Failed to add event to database....");
  //   }

  //   // hide the loading screen
  //   loading.style.display = "none";
  // });

  // Dialog Logic
  const createMeetingDialog = document.querySelector("#create-meeting-dialog");
  const dialogForm = document.querySelector("#create-meeting-dialog form");
  const createMeetingButton = document.querySelector("#create-meeting-button");
  const dialogCloseButton = document.querySelector(".modal-close");

  function toggleNewTaskForm() {
    const dialog = document.querySelector("#create-meeting-dialog");
    dialog.open ? dialog.close() : dialog.showModal();
  }

  createMeetingButton.addEventListener("click", toggleNewTaskForm);
  dialogCloseButton.addEventListener("click", toggleNewTaskForm);

  // If click outside dialog, close
  if (createMeetingDialog) {
    createMeetingDialog.addEventListener("click", (e) => {
      if (e.target === createMeetingDialog) createMeetingDialog.close();
    });
  }

  if (dialogForm) {
    dialogForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const payload = {
        meetingSubject: form["meetingSubject"].value,
        meetingDescription: form["meetingDescription"].value,
        meetingStart: form["meetingStart"].value,
        meetingEnd: form["meetingEnd"].value,
      };

      const startDateObj = new Date(payload.meetingStart);
      const endDateObj = new Date(payload.meetingEnd);

      const startDateTz = new Date(payload.meetingStart).toISOString();
      const endDateTz = new Date(payload.meetingEnd).toISOString();

      console.log(startDateObj, payload.meetingStart, 'These are the dates...')

      if (
        startDateObj > endDateObj ||
        startDateObj <= new Date() ||
        endDateObj <= new Date()
      ) {
        alert(
          "Error creating meeting! Dates must be in the future or start date must preceed end date!",
        );
        return;
      }

      try {
        console.log('we are here')
        // send a meeting to the web socket
        socket.emit('meeting', {
            projectId: projectId,
            location: "Online",
            description: payload.meetingDescription,
            subject: payload.meetingSubject,
            start: startDateTz,
            end: endDateTz,
        })

        // create notifications for other group members
        socket.emit('notification', {
            targetUsers: groupUsers
            .filter(u => u.user_id !== userId)
            .map(u => u.user_id),
            projectId: projectId,
            notificationType: "Meeting",
            notificationMessage: `${username} set a new meeting in ${projectName}`,
        });
      } catch (err) {
        alert(
          "Error creating meeting."
        )
      }
    });
  }

  // hide loading screen
  loading.style.display = "none";
}

projectCalendar();

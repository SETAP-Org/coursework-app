const socket = io();

function projectCalendar() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // ejs values
  const { meetings, projectId, groupUsers, userId, username, projectName } = window.scriptData;

  // getting dom elements
  const eventsList = document.querySelector("#events-list");
  const eventTemplate = document.querySelector(".event-template");
  const createMeetingDialog = document.querySelector("#create-meeting-dialog");
  const dialogForm = document.querySelector("#create-meeting-dialog form");
  const createMeetingButton = document.querySelector("#create-meeting-button");
  const dialogCloseButton = document.querySelector(".modal-close");

  // add full calendar modal to the ui
  const calendarEl = document.querySelector('#calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth'
  });
  calendar.render();

  // function to add event to the ui
  function addEventToUi(title, start, end, description) {
    calendar.addEvent({
      title: title,
      start: start,
      end: end,
      description: description,
    });
  }

  // populating the calendar
  for (const meeting of meetings) {
    addEventToUi(
      meeting.meeting_subject,
      meeting.meeting_start,
      meeting.meeting_end,
      meeting.meeting_description,
    );
  }

  // adds meeting to calendar when new meeting is added
  socket.on("meeting", (meeting) => {
    addEventToUi(
      meeting.meeting_subject,
      meeting.meeting_start,
      meeting.meeting_end,
      meeting.meeting_description,
    )
  })

  // function to show or hide new meeting dialog
  function toggleNewMeetingForm() {
    const dialog = document.querySelector("#create-meeting-dialog");
    dialog.open ? dialog.close() : dialog.showModal();
  }

  createMeetingButton.addEventListener("click", toggleNewMeetingForm);
  dialogCloseButton.addEventListener("click", toggleNewMeetingForm);

  // If click outside dialog, close
  if (createMeetingDialog) {
    createMeetingDialog.addEventListener("click", (e) => {
      if (e.target === createMeetingDialog) createMeetingDialog.close();
    });
  }

  // event listener to handle new meeting submit
  if (dialogForm) {
    dialogForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // getting the values from the form
      const form = e.target;
      const payload = {
        meetingSubject: form["meetingSubject"].value,
        meetingDescription: form["meetingDescription"].value,
        meetingStart: form["meetingStart"].value,
        meetingEnd: form["meetingEnd"].value,
      };

      // formatting the date
      const startDateObj = new Date(payload.meetingStart);
      const endDateObj = new Date(payload.meetingEnd);
      const startDateTz = new Date(payload.meetingStart).toISOString();
      const endDateTz = new Date(payload.meetingEnd).toISOString();

      // exit submit if relevant time conditions are not met
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
        // send a meeting to the web socket
        socket.emit('meeting', {
            projectId: projectId,
            location: "Virtual",
            description: payload.meetingDescription,
            subject: payload.meetingSubject,
            start: startDateTz,
            end: endDateTz,
        })

        // create notifications for other group members
        socket.emit('notification', {
            targetUsers: groupUsers
            .filter(u => u.user_id !== userId)
            .map(u => u.user_id) || [],
            projectId: projectId,
            notificationType: "Meeting",
            notificationMessage: `${username} set a new meeting in ${projectName}`,
        });
      } catch (err) {
        alert(
          err.message
        )
      }
    });
  }

  // hide loading screen
  loading.style.display = "none";
}

projectCalendar();
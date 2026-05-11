const notifSocket = io();

async function userNav() {
  const loading = document.querySelector(".loading");
  if (loading) loading.style.display = "flex";

  const homeBtn = document.querySelector("#home-button");
  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");
  const notificationBell = document.querySelector(".notif-bell");
  const bellNumber = document.querySelector("#notif-bell-num");
  const bellNumBubble = document.querySelector("#notif-bell-num-bubble");
  const notificationBox = document.querySelector("#notif-dialog");
  const notifInnerContainer = document.querySelector(".dialog-inner-container");
  const notifList = document.querySelector(".notif-list");
  const notifTemplate = document.querySelector(".notif-template");

  const { username, userId } = window.scriptData;

  // Keep core nav working even if notifications fail.
  if (homeBtn) homeBtn.href = `/${username}`;
  if (projectsBtn) projectsBtn.href = `/${username}/projects`;
  if (profileBtn) {
    profileBtn.href = `/${username}/profile`;
    profileBtn.addEventListener("click", () => {
      window.location.href = `/${username}/profile`;
    });
  }

  if (notificationBell && notificationBox) {
    notificationBell.addEventListener("click", () => notificationBox.showModal());
    notificationBox.addEventListener("click", (e) => {
      if (e.target === notificationBox) notificationBox.close();
    });
  }

  // No notifications UI present on this page; still keep nav links functional.
  if (!notifInnerContainer || !notifList || !notifTemplate || !bellNumber || !bellNumBubble) {
    if (loading) loading.style.display = "none";
    return;
  }

  let notificationData = { success: false, notifications: [] };
  try {
    const notificationResponse = await fetch(`/api/notifications/${userId}`);
    notificationData = await notificationResponse.json();
  } catch (err) {
    console.error("Notifications failed to load:", err);
  }

  // function to add notification ui element
  function addNotificationUi(
    id,
    type,
    message,
    targetUsername = null,
    projectName = null,
    projectId = null,
  ) {

    console.log(id, type, message, targetUsername, projectName, projectId, 'last is the id');
    // creating the clone of the template
    const clone = notifTemplate.content.cloneNode(true);
    const listItem = clone.querySelector(".notif-list-item");

    // setting the text of the notification
    const text = clone.querySelector(".notif-list-text");
    text.innerText = message;
    if (type === "Member Join" && targetUsername === username)
      text.innerText = `You have been added to ${projectName}`;
    else if (type === "Leader" && targetUsername === username)
      text.innerText = `You have been promoted to team leader in ${projectName}`;

    // sets the target url when notification is clicked
    listItem.addEventListener("click", async () => {
      if (loading) loading.style.display = "flex";

      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      listItem.remove();

      // update the list if no more items left
      if (notifList.children.length === 1) {
        // add the no more notifications message
        const notifMessage = document.createElement("p");
        notifMessage.className = "notif-message";
        notifMessage.innerText = "You currently have no notifications.";
        notifInnerContainer.appendChild(notifMessage);
      }

      bellNumber.innerText = parseInt(bellNumber.innerText, 10) - 1;
      if (bellNumber.innerText === "0") {
        bellNumBubble.style.display = "none";
      }

      if (loading) loading.style.display = "none";

      if (type === "Message")
        window.location.href = `/${username}/projects/${projectId}/chat`;
      else if (type === "Member Leave" || type === "Member Join")
        window.location.href = `/${username}/projects/${projectId}`;
      else if (type === "Leader")
        window.location.href = `/${username}/projects/${projectId}`;
      else if (type === "Task")
        window.location.href = `/${username}/projects/${projectId}/tasks`;
      else if (type === "Meeting")
        window.location.href = `/${username}/projects/${projectId}/calendar`;
    });

    // event listener to delete notification
    clone.querySelector(".bin-icon").addEventListener("click", async (e) => {
      // prevent clicking the element underneath the bin element
      e.stopPropagation();

      // show the loading screen
      if (loading) loading.style.display = "flex";

      // deleting the notification from the db
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      // removing the notifiacation visually
      listItem.remove();

      // after deleting, if there are no more notifications, then show a relevant message
      if (notifList.children.length === 1) {
        const notifMessage = document.createElement("p");
        notifMessage.className = "notif-message";
        notifMessage.innerText = "You currently have no notifications.";
        notifInnerContainer.appendChild(notifMessage);
      }

      // reduce the number above the bell icon
      bellNumber.innerText = parseInt(bellNumber.innerText, 10) - 1;

      // hide the bubble altogether if number is 0
      if (bellNumber.innerText === "0") bellNumBubble.style.display = "none";

      // hide the loading screen
      if (loading) loading.style.display = "none";
    });

    // add to the ui
    notifList.appendChild(clone);
  }

  // populate the notifications panel (either with notifications or a message)
  if (!notificationData.success || !notificationData.notifications.length) {
    const notifMessage = document.createElement("p");
    notifMessage.className = "notif-message";

    // set the message text based on the situation
    if (!notificationData.success)
      notifMessage.innerText = "Notifications failed to load.";
    else notifMessage.innerText = "You currently have no notifications.";

    // add the message to the notification box and set the bell icon number to 0
    notifInnerContainer.appendChild(notifMessage);
    bellNumber.innerText = notificationData.notifications.length;
    bellNumBubble.style.display = "none";
  } else {
    for (const notification of notificationData.notifications) {
      console.log(notification, 'this is the notification...')
      addNotificationUi(
        notification.notification_id,
        notification.notification_type,
        notification.notification_message,
        notification.target_username,
        notification.project_name,
        notification.project_id,
      );
    }

    // updating the bell bubble
    bellNumber.innerText = notificationData.notifications.length;
    bellNumBubble.style.display = "flex";
  }

  // socket handling when recieving notification
  notifSocket.on("notification", (notif) => {
    if (notif.notification.targetUsers.includes(userId)) {
      // remove the info message that appears with no notifications
      if (
        [...notifInnerContainer.children].some(
          (child) => child.className === "notif-message",
        )
      ) {
        document.querySelector(".notif-message").remove();
      }

      // add the notification to the ui
      addNotificationUi(
        notif.notification.notificationId,
        notif.notification.notificationType,
        notif.notification.notificationMessage,
        notif.notification.targetUsername,
        notif.notification.projectName,
        notif.notification.projectId,
      );

      // increment the bubble counter and show it if not already showing
      bellNumber.innerText = parseInt(bellNumber.innerText, 10) + 1;
      bellNumBubble.style.display = "flex";
    }
  });

  // hide loading screen
  if (loading) loading.style.display = "none";
}

userNav();

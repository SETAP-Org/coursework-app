const notifSocket = io();

async function navInit() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // ejs values
  const { username, userId } = window.scriptData;

  // fetching notifications
  const notificationResponse = await fetch(`/api/notifications/${userId}`);
  const notificationData = await notificationResponse.json();
  
  // getting dom elements
  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");
  const check = document.getElementById("check");
  const navMobile = document.querySelector(".nav-mobile");
  const notificationBell = document.querySelector(".notif-bell");
  const notificationBox = document.querySelector("#notif-dialog");
  const notifInnerContainer = document.querySelector(".dialog-inner-container");
  const notifList = document.querySelector(".notif-list");
  const notifTemplate = document.querySelector(".notif-template");


  // assigning urls to nav buttons
  if (projectsBtn) {
    projectsBtn.href = `/${username}/projects`;
  }

  if (profileBtn) {
    profileBtn.href = `/${username}/profile`;
  }

  // close nav when a menu link is clicked
  if (check || navMobile) {
    navMobile.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) {
        check.checked = false;
      }
    });
  }

  // Close nav-mobile when clicking outside menu
  document.addEventListener("click", (e) => {
    if (!check || !navMobile) {
      return;
    }

    // Ignore clicks of the actual burger button
    if (e.target === check) {
      return;
    }
    if (e.target.closest(".checkbtn")) {
      return;
    }

    // Don't close if clicking inside the menu
    if (navMobile.contains(e.target)) {
      return;
    }

    // Close the menu
    check.checked = false;
  });

  // NOTIFICATIONS
  // event listener to show notif dialog
  notificationBell.addEventListener("click", () => {
    notificationBox.showModal();
  })

  // event listener to close notif dialog when clicked outside
  notificationBox.addEventListener("click", (e) => {
    if (e.target === notificationBox) notificationBox.close();
  });

  // populate the notifications panel
  if (!notificationData.success) {
    const notifMessage = document.createElement("p");
    notifMessage.className = "notif-message";
    notifMessage.innerText = "Notifications failed to load."
    notifInnerContainer.appendChild(notifMessage);
  } else if (notificationData.notifications.length === 0) {
    const notifMessage = document.createElement("p");
    notifMessage.className = "notif-message";
    notifMessage.innerText = "You currently have no notifications."
    notifInnerContainer.appendChild(notifMessage);
  } else {
    for (const notification of notificationData.notifications) {
      // clone the template
      const clone = notifTemplate.content.cloneNode(true);
  
      // change the values in the clone
      clone.querySelector('.notif-list-info').innerText = notification.notification_message;
  
      // add the item to the list
      notifList.appendChild(clone);
    }
  }

  // socket for new notification
  notifSocket.on("notification", (notif) => {
    if (notif.targetUsers.includes(userId)) {
      if (notif.notificationType === "Message") {
        // clone the template
        const clone = notifTemplate.content.cloneNode(true);
    
        // change the values in the clone
        clone.querySelector('.notif-list-info').innerText = notif.notificationMessage;
    
        // add the item to the start of the list
        notifList.prepend(clone);
      }
    }
  })

  // hide loading screen
  loading.style.display = "none";
}

navInit();
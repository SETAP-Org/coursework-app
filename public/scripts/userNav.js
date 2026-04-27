const notifSocket = io();

async function userNav() {
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
    const notificationBell = document.querySelector(".notif-bell");
    const bellNumber = document.querySelector("#notif-bell-num");
    const bellNumBubble = document.querySelector("#notif-bell-num-bubble");
    const notificationBox = document.querySelector("#notif-dialog");
    const notifInnerContainer = document.querySelector(".dialog-inner-container");
    const notifList = document.querySelector(".notif-list");
    const notifTemplate = document.querySelector(".notif-template");

    // assigning urls to nav buttons
    if (projectsBtn) projectsBtn.href = `/${username}/projects`;
    if (profileBtn) profileBtn.href = `/${username}/profile`;

    // NOTIFICATIONS
    // event listener to open and close notification dialog
    notificationBell.addEventListener("click", () => notificationBox.showModal());
    notificationBox.addEventListener("click", (e) => {
        if (e.target === notificationBox) notificationBox.close();
    });

    // populate the notifications panel
    if (!notificationData.success) {
        const notifMessage = document.createElement("p");
        notifMessage.className = "notif-message";
        notifMessage.innerText = "Notifications failed to load.";
        notifInnerContainer.appendChild(notifMessage);
    } else if (notificationData.notifications.length === 0) {
        const notifMessage = document.createElement("p");
        notifMessage.className = "notif-message";
        notifMessage.innerText = "You currently have no notifications.";
        notifInnerContainer.appendChild(notifMessage);
        bellNumber.innerText = notificationData.notifications.length;
        bellNumBubble.style.display = "none";
    } else {
        for (const notification of notificationData.notifications) {
            // getting the clone elements
            const clone = notifTemplate.content.cloneNode(true);
            const listItem = clone.querySelector(".notif-list-item");

            console.log(notification, 'this is the notification');

            // sets the text of the notification
            clone.querySelector(".notif-list-text").innerText = notification.notification_message;
            if (notification.notification_type === "Member Join" && notification.target_username === username) {
                clone.querySelector('.notif-list-text').innerText = `You have been added to ${notification.project_name}`;
            }

            // sets the target url when notification is clicked
            listItem.addEventListener("click", () => {
                if (notification.notification_type === "Message") {
                    window.location.href = `/${username}/projects/${notification.project_id}/chat`
                } else if (notification.notification_type === "Member Leave" || notification.notification_type === "Member Join") {
                    window.location.href = `/${username}/projects/${notification.project_id}`
                } else if (notification.notification_type === "Leader") {
                    window.location.href = `/${username}/projects/${notification.project_id}`
                } else if (notification.notification_type === "Task") {
                    window.location.href = `/${username}/projects/${notification.project_id}/tasks`
                }
            });

            // bin event listener
            clone.querySelector(".bin-icon").addEventListener("click", async (e) => {
                e.stopPropagation();

                loading.style.display = "flex";

                const response = await fetch(`/api/notifications/${notification.notification_id}`, {
                    method: "DELETE"
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

                loading.style.display = "none";
            });

            // adding the clone to the list
            notifList.appendChild(clone);
        }

        // updating the bell bubble
        bellNumber.innerText = notificationData.notifications.length;
        bellNumBubble.style.display = "flex";
    }

    // socket handling when recieving notification
    notifSocket.on("notification", (notif) => {
        if (notif.notification.targetUsers.includes(userId)) {
            // remove the info message that appears with no notifications
            if ([...notifInnerContainer.children].some(child => child.className === "notif-message")) {
                document.querySelector(".notif-message").remove();
            }

            // getting the clone elements
            const clone = notifTemplate.content.cloneNode(true);
            const pTag = clone.querySelector('.notif-list-text');
            const listItem = clone.querySelector(".notif-list-item");

            // sets the text of the notification
            clone.querySelector('.notif-list-text').innerText = notif.notification.notificationMessage;
            if (notif.notification.notificationType === "Member Join" && notif.notification.targetUsername === username) {
                clone.querySelector('.notif-list-text').innerText = `You have been added to ${notif.notification.projectName}`;
            }

            // sets the target url when notification is clicked
            listItem.addEventListener("click", () => {
                if (notif.notification.notificationType === "Message") {
                    window.location.href = `/${username}/projects/${notif.notification.projectId}/chat`
                } else if (notif.notification.notificationType === "Member Leave" || notif.notification.notificationType === "Member Join") {
                    window.location.href = `${username}/projects/${notif.notification.projectId}`
                } else if (notif.notification.notificationType === "Leader") {
                    window.location.href = `${username}/projects/${notif.notification.projectId}`
                } else if (notif.notification.notificationType === "Task") {
                    window.location.href = `${username}/projects/${notif.notification.projectId}/tasks`
                }
            });

            // bin event listener
            clone.querySelector(".bin-icon").addEventListener("click", async (e) => {
                e.stopPropagation();

                loading.style.display = "flex";

                const response = await fetch(`/api/notifications/${notif.dbReturn.notification_id}`, {
                    method: "DELETE"
                });
                const data = await response.json();

                listItem.remove();

                // update the list if no more items left
                if (notifList.children.length === 1) {
                    const notifMessage = document.createElement("p");
                    notifMessage.className = "notif-message";
                    notifMessage.innerText = "You currently have no notifications.";
                    notifInnerContainer.appendChild(notifMessage);
                }

                bellNumber.innerText = parseInt(bellNumber.innerText, 10) - 1;
                if (bellNumber.innerText === "0") {
                    bellNumBubble.style.display = "none";
                }

                loading.style.display = "none";
            });

            // adding the clone to the list
            notifList.prepend(clone);

            // increment the bubble counter and show it
            bellNumber.innerText = parseInt(bellNumber.innerText, 10) + 1;
            bellNumBubble.style.display = "flex";
        }
    });

    // hide loading screen
    loading.style.display = "none";
}

userNav();
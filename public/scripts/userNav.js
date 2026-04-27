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
    } else {
        for (const notification of notificationData.notifications) {
            const clone = notifTemplate.content.cloneNode(true);
            const listItem = clone.querySelector(".notif-list-item");

            clone.querySelector(".notif-list-text").innerText = notification.notification_message;
            clone.querySelector(".bin-icon").addEventListener("click", async () => {
                loading.style.display = "flex";

                const response = await fetch(`/api/notifications/${notification.notification_id}`, {
                    method: "DELETE"
                });
                const data = await response.json();

                listItem.remove();

                console.log(notifList.children, 'These are the children')

                console.log(notifList.children.length, 'This is the length')

                // update the list if no more items left
                if (notifList.children.length === 1) {
                    // add the no more notifications message
                    const notifMessage = document.createElement("p");
                    notifMessage.className = "notif-message";
                    notifMessage.innerText = "You currently have no notifications.";
                    notifInnerContainer.appendChild(notifMessage);
                }

                loading.style.display = "none";
            });
            notifList.appendChild(clone);
        }
        bellNumber.innerText = notificationData.notifications.length;
    }

    // socket handling when recieving notification
    notifSocket.on("notification", (notif) => {
        if (notif.targetUsers.includes(userId)) {
            if (notif.notificationType === "Message") {
                const clone = notifTemplate.content.cloneNode(true);
                const pTag = clone.querySelector('.notif-list-text');
                console.log(pTag, 'this is the p tag.........')
                clone.querySelector('.notif-list-text').innerText = notif.notificationMessage;
                notifList.prepend(clone);
            }
        }
    });

    // hide loading screen
    loading.style.display = "none";
}

userNav();
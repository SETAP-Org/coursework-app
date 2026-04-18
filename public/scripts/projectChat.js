const socket = io();

// function to format time given from message in database
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const localDate = date.toLocaleString("en-UK", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const splitDate = localDate.split(", ")[0];
    const splitTime = localDate.split(", ")[1].split(":");
    const formattedTime = `${splitTime[0]}:${splitTime[1]}`;

    return {
        date: splitDate,
        time: formattedTime,
    }
}

async function projectChat() {
    const { userId, projectId, projectName } = window.scriptData;
    const messages = window.scriptData.messages;
    const groupUsers = window.scriptData.groupUsers;

    // get a hold of the elements that you are trying to access
    const messageForm = document.querySelector(".chat-form");
    const messageFieldSet = document.querySelector(".chat-fieldset");
    const messageBox = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".chat-send");
    const messagesContainer = document.querySelector(".chat-messages");
    let messageContent = "";

    // messages container population
    for (const message of messages) {
        // creating the elements
        const container = document.createElement("div");
        const infoTop = document.createElement("p");
        const bubble = document.createElement("div");
        const content = document.createElement("p");
        const infoBottom = document.createElement("p");

        // configuring the elements
        content.innerText = message.message_content

        if (message.sender_id != userId) {
            // getting the username of the sender
            const senderUsername = groupUsers.find(u => u.user_id === message.sender_id).username;

            infoTop.innerText = `Sent by ${senderUsername}`;
            container.className = "message-container-left";
            infoTop.className = "message-info-left";
            infoBottom.className = "message-info-left";
            bubble.className = "message-bubble-left";
            content.className = "message-content-left";
        } else {
            container.className = "message-container-right";
            infoTop.className = "message-info-right";
            infoBottom.className = "message-info-right";
            bubble.className = "message-bubble-right";
            content.className = "message-content-right";
        }

        const {date, time} = formatTime(message.m_date_sent);

        infoBottom.innerText = `${date} | ${time}`;

        // composing elements
        if (message.sender_id != userId) {
            container.appendChild(infoTop);
        }
        container.appendChild(bubble);
        container.appendChild(infoBottom)
        bubble.appendChild(content);

        // adding the message to message container
        messagesContainer.appendChild(container);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // form event listener
    messageForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        messageFieldSet.disabled = true;

        // const response = await fetch("/api/chat/addMessage", {
        //     method: "post",
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({ messageContent }),
        // });

        // const data = await response.json();
        // console.log(data.message);

        socket.emit('chat', {
            senderId: userId,
            projectId: projectId,
            message: messageContent,
        })

        messageFieldSet.disabled = false;
        messageBox.value = "";
    })
    
    // input box event listener
    messageBox.addEventListener("input", (e) => {
        messageContent = e.target.value;
        if (!messageContent.length) sendBtn.disabled = true;
        else sendBtn.disabled = false;
    })

    // send button event listener
    sendBtn.addEventListener("click", () => {

    })

    // handling messages incoming from socket io
    socket.on('chat', (message) => {
        if (message.project_id == projectId) {
            // creating the elements
            const container = document.createElement("div");
            const infoTop = document.createElement("p");
            const bubble = document.createElement("div");
            const content = document.createElement("p");
            const infoBottom = document.createElement("p");

            // configuring the elements
            content.innerText = message.message_content

            if (message.sender_id != userId) {
                infoTop.innerText = `Sent by ${message.sender_id}`
                container.className = "message-container-left";
                infoTop.className = "message-info-left";
                infoBottom.className = "message-info-left";
                bubble.className = "message-bubble-left";
                content.className = "message-content-left";
            } else {
                container.className = "message-container-right";
                infoTop.className = "message-info-right";
                infoBottom.className = "message-info-right";
                bubble.className = "message-bubble-right";
                content.className = "message-content-right";
            }

            const {date, time} = formatTime(message.m_date_sent);

            infoBottom.innerText = `${date} | ${time}`;

            // composing elements
            if (message.sender_id != userId) {
                container.appendChild(infoTop);
            }
            container.appendChild(bubble);
            container.appendChild(infoBottom)
            bubble.appendChild(content);

            // adding the message to message container
            messagesContainer.appendChild(container);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    })
}

projectChat();
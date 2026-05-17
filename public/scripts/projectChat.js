import { formatTime } from "/scripts/utils.js";

const socket = io();

async function projectChat() {
    // show loading screen
    const loading = document.querySelector(".loading");
    loading.style.display = "flex";

    // ejs variables
    const {
        userId,
        username,
        projectId,
        projectName,
        messages,
        groupUsers
    } = window.scriptData;

    // get a hold of the elements that you are trying to access
    const messageForm = document.querySelector(".chat-form");
    const messageFieldSet = document.querySelector(".chat-fieldset");
    const messageBox = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".chat-send");
    const messagesContainer = document.querySelector(".chat-messages");
    const chatMsgTemplate = document.querySelector("#chat-message-template");
    let messageContent = "";

    // function to add a message to the ui
    function addMessageToUi(message) {
        // scrolling to the bottom of the chat - similar to a real group chat
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // clone the template
        const clone = chatMsgTemplate.content.cloneNode(true);
        const container = clone.querySelector('#message-container');
        const infoTop = clone.querySelector('#message-info-top');
        const bubble = clone.querySelector('#message-bubble');
        const content = clone.querySelector('#message-content');
        const infoBottom = clone.querySelector('#message-info-bottom');

        // change the values in the clone
        content.innerText = message.message_content;

        // if message was sent by someone else
        if (message.sender_id != userId) {
            // getting the username of the sender
            const senderUsername = groupUsers.find(u => u.user_id === message.sender_id).username;

            // change the values in the clone
            clone.querySelector('#message-info-top').innerText = `Sent by ${senderUsername}`;

            // update the styles of the cloned elements
            container.className = "message-container-left";
            infoTop.className = "message-info-left";
            infoBottom.className = "message-info-left";
            bubble.className = "message-bubble-left";
            content.className = "message-content-left";
        }
        // if message was sent by you
        else {
            // update the styles of the cloned elements
            container.className = "message-container-right";
            infoTop.className = "message-info-right";
            infoBottom.className = "message-info-right";
            bubble.className = "message-bubble-right";
            content.className = "message-content-right";
        }

        // adding the time and data to the bottom of the message
        const {date, time} = formatTime(message.m_date_sent);
        infoBottom.innerText = `${date} | ${time}`;

        // adding the message to message container
        messagesContainer.appendChild(clone);

        // scrolling to the bottom of the chat - similar to a real group chat
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // messages container population
    for (const message of messages) {
        addMessageToUi(message);
    }

    // event listener to send message on form submit
    messageForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // send the message
        loading.style.display = "flex";
        messageFieldSet.disabled = true;

        // send a chat message to the web socket
        socket.emit('chat', {
            senderId: userId,
            projectId: projectId,
            message: messageContent,
        }, (ack) => {
            if (!ack.success) {
                alert(ack.message);
            }
        })

        // create notifications for other group members
        socket.emit('notification', {
            targetUsers: groupUsers
            .filter(u => u.user_id !== userId)
            .map(u => u.user_id),
            projectId: projectId,
            notificationType: "Message",
            notificationMessage: `${username} sent a new message in ${projectName}`,
        });
        
        // allow typing in the fieldset again once processing is complete
        messageFieldSet.disabled = false;
        messageBox.value = "";

        // hide the loading screen
        loading.style.display = "none";
    })
    
    // event listener on message box to update message content value and disable button if message box is empty
    messageBox.addEventListener("input", (e) => {
        messageContent = e.target.value;

        if (!messageContent.length) sendBtn.disabled = true;
        else sendBtn.disabled = false;
    })

    // handling messages incoming from socket io
    socket.on('chat', (message) => {
        if (message.project_id == projectId) {
            addMessageToUi(message);
        }
    })

    // hide loading screen
    loading.style.display = "none";
}

projectChat();
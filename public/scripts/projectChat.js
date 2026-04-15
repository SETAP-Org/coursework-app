// function to format time given from message in database
function formatTime(timestamp) {
    // 2026-04-14T22:50:32.656Z

    const splitDate = timestamp.split("T")[0].split("-");
    const splitTime = timestamp.split("T")[1].split(":");

    const formattedDate = `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    const formattedTime = `${splitTime[0]}:${splitTime[1]}`;

    return {
        date: formattedDate,
        time: formattedTime,
    }
}

async function projectChat() {
    // loading the messages and the user
    const chatResponse = await fetch("/api/chat");
    const { messages } = await chatResponse.json();

    const meResponse = await fetch("/api/me");
    const { dbUser } = await meResponse.json();

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

        if (message.sender_id != dbUser.user_id) {
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
        if (message.sender_id != dbUser.user_id) {
            container.appendChild(infoTop);
        }
        container.appendChild(bubble);
        container.appendChild(infoBottom)
        bubble.appendChild(content);

        // adding the message to message container
        messagesContainer.appendChild(container);
    }

    // form event listener
    messageForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const response = await fetch("/api/chat/addMessage", {
            method: "post",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ messageContent }),
        });

        const data = await response.json();
        console.log(data.message);
    })
    
    messageBox.addEventListener("input", (e) => {
        messageContent = e.target.value;
        if (!messageContent.length) sendBtn.disabled = true;
        else sendBtn.disabled = false;
    })

    // send button event listener
    sendBtn.addEventListener("click", () => {

    })

}

projectChat();
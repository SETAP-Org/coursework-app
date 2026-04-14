async function projectChat() {
    // get a hold of the elements that you are trying to access
    const messageForm = document.querySelector(".chat-form");
    const messageFieldSet = document.querySelector(".chat-fieldset");
    const messageBox = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".chat-send");
    let messageContent = "";

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
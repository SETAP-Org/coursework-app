async function projectChat() {
    // get a hold of the elements that you are trying to access
    const messageForm = document.querySelector(".chat-form");
    const messageFieldSet = document.querySelector(".chat-fieldset");
    const messageBox = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".chat-send");

    // form event listener
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
    })

    // message box event listener
    let messageContent = "";
    
    messageBox.addEventListener("input", (e) => {
        messageContent = e.target.value;
        if (!messageContent.length) sendBtn.disabled = true;
        else sendBtn.disabled = false;
    })

    // send button event listener
    sendBtn.addEventListener("click", () => {
        console.log("we are getting here!");
    })

}

projectChat();
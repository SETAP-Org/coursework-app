// function 
async function loadProfile() {
  // ejs variables
  const { user } = window.scriptData;

  const usernameBtn = document.querySelector(".username-save-button");
  const usernameInput = document.querySelector(".username-input");
  const usernameMsg = document.querySelector(".username-message");
  const usernameForm = document.querySelector(".username-form");
  const usernameDialog = document.querySelector(".username-dialog");
  const usernameDialogBtn = document.querySelector(".username-dialog-button");
  let usernameValue = "";
  const regex = /^(?!^[0-9]+$)[a-zA-Z0-9]+$/;

  // event listerer for input box
  usernameInput.addEventListener("input", (e) => {
    usernameValue = e.target.value;
    
    if (usernameValue.length == 0) {
      usernameMsg.innerText = "";
      usernameBtn.disabled = true;
    } else if (usernameValue.length < 3) {
      usernameMsg.innerText = "Username must be at least 3 characters long";
      usernameBtn.disabled = true;
    } else if (usernameValue.length > 20) {
      usernameMsg.innerText = "Username must be less than 20 characters long";
      usernameBtn.disabled = true;
    } else if (!regex.test(usernameValue)) {
      usernameMsg.innerText = "Username must contain letters and numbers only";
      usernameBtn.disabled = true;
    } else {
      usernameMsg.innerText = "I like this username :)";
      usernameBtn.disabled = false;
    }
  })

  // event listener for change username form submit
  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch('/api/users/changeUsername', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameValue })
    });
    const data = await response.json();

    console.log(data)

    usernameMsg.innerText = data.message;

    usernameInput.value = "";

    if (data.success) {
      usernameDialog.showModal();
    }
  })

  // event handler for dialog button
  usernameDialogBtn.addEventListener("click", () => {
    window.location.replace("/");
  })
}

loadProfile();
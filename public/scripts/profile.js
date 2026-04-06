// function 
async function loadProfile() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();

    const usernameBtn = document.querySelector(".username-save-button");
    const usernameInput = document.querySelector(".username-input");
    const usernameMsg = document.querySelector(".username-message");
    const usernameForm = document.querySelector(".username-form");
    let usernameValue = "";
    const regex = /^(?!^[0-9]+$)[a-zA-Z0-9]+$/;

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

    usernameForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const response = await fetch('/api/users/changeUsername', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameValue })
      });

      const result = await response.json();

      usernameMsg.innerText = result.message;

      usernameInput.value = "";
    })

    document.getElementById("profile-name").textContent = data.name || "Unknown User";
  } catch (error) {
    console.error("Error loading profile:", error);
    document.getElementById("profile-name").textContent = "Error in user";
  }
}



loadProfile();
// function 
async function loadProfile() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();

    const usernameBtn = document.querySelector(".username-save-button");
    const usernameInput = document.querySelector(".username-input");
    const usernameMsg = document.querySelector(".username-message");
    let usernameValue = "";
    const regex = /^(?!^[0-9]+$)[a-zA-Z0-9]+$/;

    usernameInput.addEventListener("input", (e) => {
      usernameValue = e.target.value;
      
      if (usernameValue.length == 0) usernameMsg.innerText = ""
      else if (usernameValue.length < 3) usernameMsg.innerText = "Username must be at least 3 characters long"
      else if (usernameValue.length > 20) usernameMsg.innerText = "Username must be less than 20 characters long"
      else if (!regex.test(usernameValue)) usernameMsg.innerText = "Username must contain letters and numbers only"
      else usernameMsg.innerText = "I like this username :)"
    })

    usernameBtn.addEventListener("click", (e) => {
      console.log('we have clicked!')
    })

    document.getElementById("profile-name").textContent = data.name || "Unknown User";
  } catch (error) {
    console.error("Error loading profile:", error);
    document.getElementById("profile-name").textContent = "Error in user";
  }
}



loadProfile();
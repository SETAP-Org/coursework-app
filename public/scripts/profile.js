import { getCookie, setCookie } from "/scripts/utils.js";

async function loadProfile() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // ejs variables
  const { username } = window.scriptData;

  // DOM elements
  const usernameBtn = document.querySelector(".username-save-button");
  const usernameInput = document.querySelector(".username-input");
  const usernameMsg = document.querySelector(".username-message");
  const usernameForm = document.querySelector(".username-form");
  const usernameDialog = document.querySelector(".username-dialog");
  const usernameDialogBtn = document.querySelector(".username-dialog-button");
  const themeStyleSheet = document.querySelector("#theme-stylesheet");
  const changeThemeButton = document.querySelector("#change-theme-button");
  const regex = /^(?!^[0-9]+$)[a-zA-Z0-9]+$/;
  let usernameValue = "";

  // event listerer for input box
  usernameInput.addEventListener("input", (e) => {
    usernameValue = e.target.value;

    // sets the submit button disabled state based on validity of username
    if (
      usernameValue.length < 3 ||
      usernameValue.length > 20 ||
      !regex.test(usernameValue)
    ) usernameBtn.disabled = true;
    else usernameBtn.disabled = false;
    
    // changes the value of the text under the input box based on the length of the input username
    if (usernameValue.length == 0) usernameMsg.innerText = "";
    else if (usernameValue.length < 3) usernameMsg.innerText = "Username must be at least 3 characters long";
    else if (usernameValue.length > 20) usernameMsg.innerText = "Username must be less than 20 characters long";
    else if (!regex.test(usernameValue)) usernameMsg.innerText = "Username must contain letters and numbers only";
    else usernameMsg.innerText = "I like this username :)";
  })

  // event listener for change username form submit
  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // show loading screen
    loading.style.display = "flex";

    // if username is what user already has, notify them of that
    if (usernameValue === username) {
      usernameMsg.innerText = "You already have that username!";
    } else {
      // change the username in the database
      const response = await fetch('/api/users/changeUsername', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameValue })
      });
      const data = await response.json();

      // update the ui when username is changed
      usernameMsg.innerText = data.message;
      usernameInput.value = "";
      loading.style.display = "none";
      
      // show success modal that redirects them to home after successful update
      if (data.success) {
        usernameDialog.showModal();
      };
    }
  })

  // event handler for dialog button
  usernameDialogBtn.addEventListener("click", () => window.location.replace("/"));

  // event handler to change l&d theme
  changeThemeButton.addEventListener("click", () => {
    const currentTheme = getCookie("theme");

    // change the theme in the cookie and the stylesheet
    if (currentTheme === "dark") {
      setCookie("theme", "light");
      themeStyleSheet.href = "/css/root-light.css";
    } else {
      setCookie("theme", "dark");
      themeStyleSheet.href = "/css/root-dark.css";
    }
  })

  // hide loading screen
  loading.style.display = "none";
}

loadProfile();
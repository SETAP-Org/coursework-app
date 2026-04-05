async function getHeader() {
  const response = await fetch("/components/header.html");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  const userDataJson = await fetch("/api/me");
  const userData = await userDataJson.json();
  const dbUserData = userData.dbUser;

  const el = document.getElementById("site-header");
  if (!el) return;

  // inject the header
  try {
    el.innerHTML = await getHeader();
  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Check header link in functions.js</p>";
  }

  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");

  projectsBtn.href = `/${dbUserData.username}/projects`;
  profileBtn.href = `/${dbUserData.username}/profile`;
});

async function navFunction() {
  var x = document.getElementById("MyHeader");
  if (x.className === "Dashboard-header") {
    x.className += " responsive";
  } else {
    x.className = "Dashboard-header";
  }
}

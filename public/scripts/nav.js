async function userNav() {
  const userDataJson = await fetch("/api/me");
  const userData = await userDataJson.json();
  const dbUserData = userData.dbUser;

  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");

  if (projectsBtn) {
    projectsBtn.href = `/${dbUserData.username}/projects`;
  }
  if (profileBtn) {
    profileBtn.href = `/${dbUserData.username}/profile`;
  }
}

// Close nav-mobile when clicking outside menu
document.addEventListener("click", (e) => {
  const check = document.getElementById("check");
  const navMobile = document.querySelector(".nav-mobile");

  if (!check || !navMobile) {
    return;
  }

  // Ignore clicks of the actual burger button
  if (e.target === check) {
    return;
  }
  if (e.target.closest(".checkbtn")) {
    return;
  }

  // Don't close if clicking inside the menu
  if (navMobile.contains(e.target)) {
    return;
  }

  // Close the menu
  check.checked = false;
});

userNav();

// Close nav when a menu link is clicked
(function attachNavLinkCloser() {
  const check = document.getElementById("check");
  const navMobile = document.querySelector(".nav-mobile");
  if (!check || !navMobile) return;

  navMobile.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      check.checked = false;
    }
  });
})();

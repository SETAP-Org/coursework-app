async function navInit() {
  // ejs values
  const { username } = window.scriptData;
  
  // getting dom elements
  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");
  const check = document.getElementById("check");
  const navMobile = document.querySelector(".nav-mobile");
  const notificationBell = document.querySelector(".notif-bell");
  const notificationBox = document.querySelector("#notif-dialog");

  // assigning urls to nav buttons
  if (projectsBtn) {
    projectsBtn.href = `/${username}/projects`;
  }

  if (profileBtn) {
    profileBtn.href = `/${username}/profile`;
  }

  // close nav when a menu link is clicked
  if (check || navMobile) {
    navMobile.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) {
        check.checked = false;
      }
    });
  }

  // Close nav-mobile when clicking outside menu
  document.addEventListener("click", (e) => {
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

  // NOTIFICATIONS
  // event listener to show notif dialog
  notificationBell.addEventListener("click", () => {
    notificationBox.showModal();
  })

  // event listener to close notif dialog when clicked outside
  notificationBox.addEventListener("click", (e) => {
    if (e.target === notificationBox) notificationBox.close();
  });
}

navInit();
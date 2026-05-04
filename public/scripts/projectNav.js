async function projectNav() {
  // Show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // Extract EJS values
  const { username } = window.scriptData;

  // Get DOM elements
  const projectsBtn = document.querySelector("#projects-button");
  const navCheckbox = document.getElementById("check");
  const navMobile = document.querySelector(".nav-mobile");
  const checkBtn = document.querySelector(".checkbtn");

  // Validate required elements exist
  if (!projectsBtn || !navCheckbox || !navMobile || !checkBtn) {
    console.warn("Required navigation elements not found");
    loading.style.display = "none";
    return;
  }

  // Set navigation button URL
  projectsBtn.href = `/${username}/projects`;

  // Close navigation menu when a link is clicked
  navMobile.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      navCheckbox.checked = false;
    }
  });

  // Close navigation menu when clicking outside
  document.addEventListener("click", (e) => {
    // Don't close if clicking the checkbox toggle button
    if (e.target === navCheckbox || e.target.closest(".checkbtn")) {
      return;
    }

    // Don't close if clicking inside the nav menu
    if (navMobile.contains(e.target)) {
      return;
    }

    // Close the menu
    navCheckbox.checked = false;
  });

  // Hide loading screen
  loading.style.display = "none";
}

projectNav();

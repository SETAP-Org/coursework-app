async function projectNav() {
    // show loading screen
    const loading = document.querySelector(".loading");
    loading.style.display = "flex";

    // ejs values
    const { username, projectId } = window.scriptData;

    // getting dom elements
    const projectsBtn = document.querySelector("#projects-button");
    const check = document.getElementById("check");
    const navMobile = document.querySelector(".nav-mobile");

    // assigning urls to nav buttons
    projectsBtn.href = `/${username}/projects`;

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
        if (!check || !navMobile) return;
        if (e.target === check) return;
        if (e.target.closest(".checkbtn")) return;
        if (navMobile.contains(e.target)) return;

        check.checked = false;
    });

    // hide loading screen
    loading.style.display = "none";
}

projectNav();
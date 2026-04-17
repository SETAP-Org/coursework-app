async function userDash() {
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");

  if (!projectsList || !template) return;

  try {
    const user_info_fetch = await fetch("/api/me");
    const user_info = await user_info_fetch.json();

    const username = user_info?.dbUser?.username;
    const user_first_name = user_info?.dbUser.user_first_name;

    const res = await fetch("/api/me/projects");
    if (!res.ok) {
      projectsList.innerHTML = "<li>Error loading projects.</li>";
      return;
    }

    const data = await res.json();
    if (
      !data.success ||
      !Array.isArray(data.projects) ||
      data.projects.length === 0
    ) {
      projectsList.innerHTML = "<li>No projects found.</li>";
      return;
    }

    projectsList.innerHTML = "";

    // Only show first 5 projects
    data.projects.slice(0, 5).forEach((project) => {
      const node = template.content.cloneNode(true);
      const section = node.querySelector(".user-dash-project-card-individual");
      if (section) {
        const titleEl = section.querySelector(".project-name");
        const dateEl = section.querySelector(".project-date");
        const linkEl = section.querySelector("a.project-dash-button");

        const due_date = new Date(project.project_deadline);
        const formatted_due_date = due_date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        titleEl.textContent = project.project_name;
        dateEl.textContent = formatted_due_date;

        linkEl.href = `/${encodeURIComponent(username)}/projects/${encodeURIComponent(project.project_id)}`;
        linkEl.textContent = "Go to project";

        const li = document.createElement("li");
        li.className = "project-list-item";
        li.appendChild(section);
        projectsList.appendChild(li);
      }
    });
  } catch (err) {
    console.error("Error loading user projects:", err);
    projectsList.innerHTML =
      '<li class="project-list-item">Error loading projects.</li>';
  }
};

userDash();
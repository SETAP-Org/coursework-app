async function userDash() {
  // show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // ejs data
  const { username } = window.scriptData;
  const projects = window.scriptData.projects;

  // getting relevant dom elements
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");

  try {
    if (projects.length === 0) {
      // if no projects in list...
      projectsList.innerHTML = "<li>No projects found.</li>";
    } else {
      // Only show first 5 projects
      projects.slice(0, 5).forEach((project) => {
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
    }
  } catch (err) {
    console.error("Error loading user projects:", err);
    projectsList.innerHTML =
      '<li class="project-list-item">Error loading projects.</li>';
  }

  // hide loading screen
  loading.style.display = "none";
};

userDash();
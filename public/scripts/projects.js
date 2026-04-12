function toggleNewProjectForm() {
  const dialog = document.getElementById("create-project-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

document.addEventListener("DOMContentLoaded", async () => {
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");

  try {
    const user_info_fetch = await fetch("/api/me");
    const user_info = await user_info_fetch.json();
    const user_first_name = user_info?.dbUser.user_first_name;
    const username = user_info?.dbUser.username;

    if (projectsList && template) {
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
      data.projects.forEach((project) => {
        const node = template.content.cloneNode(true);
        const section = node.querySelector(
          ".user-dash-project-card-individual",
        );
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
    console.error("Error loading projects page:", err);
    if (projectsList)
      projectsList.innerHTML = "<li>Error loading projects.</li>";
  }
});

document
  .querySelector("#create-project-button")
  .addEventListener("click", toggleNewProjectForm);

document
  .querySelector("#create-project-dialog")
  .addEventListener("click", function (e) {
    if (e.target === this) this.close();
  });

document
  .querySelector("#create-project-dialog form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form["project-name"].value;
    const deadline = form["project-deadline"].value;
    const res = await fetch(
      `/api/projects/addProject?project_name=${encodeURIComponent(name)}&project_deadline=${encodeURIComponent(deadline)}`,
      { method: "POST" },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        document.getElementById("create-project-dialog").close();
        form.reset();
      } else {
        alert(data.error);
      }
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create project.");
    }
  });

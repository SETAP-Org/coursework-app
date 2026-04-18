async function projects() {
  // ejs data
  const { username } = window.scriptData;
  const projects = window.scriptData.projects;

  // get the relevant dom elements
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");
  const dialog = document.getElementById("create-project-dialog");
  const dialogForm = document.querySelector("#create-project-dialog form");
  const createProjectBtn = document.querySelector("#create-project-button");
  const closeCreateNewFormButton = document.querySelector(".modal-close");

  try {
    // update ui based on list of projects
    if (projects.length === 0) {
      // if no projects in list...
      projectsList.innerHTML = "<li>No projects found.</li>";
    } else {
      // otherwise, loop over the projects and clone the template to populate the list
      projects.forEach((project) => {
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

    // event to open dialog when user clicks 'create new project'
    createProjectBtn.addEventListener("click", () => {
      dialog.showModal();
    });

    closeCreateNewFormButton.addEventListener("click", () => {
      dialog.close();
    });

    // event to close dialog box when clicking anywhere outside the form
    dialog.addEventListener("click", function (e) {
      if (e.target === this) this.close();
    });

    // event listener to add project
    dialogForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const name = form["project-name"].value;
      const deadline = form["project-deadline"].value;

      const res = await fetch("/api/projects/addProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: name,
          project_deadline: deadline,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          document.getElementById("create-project-dialog").close();
          form.reset();
          window.location.replace(
            `/${username}/projects/${data.project.project_id}`,
          );
        } else {
          alert(data.error);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create project.");
      }
    });
  } catch (err) {
    console.error("Error loading projects page:", err);
    if (projectsList)
      projectsList.innerHTML = "<li>Error loading projects.</li>";
  }
}

projects();
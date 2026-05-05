import { daysUntil } from "./utils.js";

async function projects() {
  // Show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // Ejs data
  const { username } = window.scriptData;
  const projects = window.scriptData.projects;

  // Get relevant dom elements
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");
  const dialog = document.querySelector("#create-project-dialog");
  const dialogForm = document.querySelector("#create-project-dialog form");
  const createProjectBtn = document.querySelector("#create-project-button");
  const closeCreateNewFormButton = document.querySelector(".modal-close");

  try {
    // Update ui based on list of projects
    if (projects.length === 0) {
      // If no projects in list
      projectsList.innerHTML = "<li>No projects found.</li>";
    } else {
      // Otherwise, loop over the projects and clone the template to populate the list
      projects.forEach((project) => {
        const node = template.content.cloneNode(true);
        const section = node.querySelector(
          ".user-dash-project-card-individual",
        );
        if (section) {
          const titleEl = section.querySelector(".project-name");
          const dateEl = section.querySelector(".project-date");
          const creatorEl = section.querySelector(".project-creator");
          const linkEl = section.querySelector("a.project-dash-button");

          const due_date = new Date(project.project_deadline);
          const formatted_due_date = due_date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          titleEl.textContent = project.project_name;
          dateEl.textContent = formatted_due_date;
          creatorEl.textContent = project.creator_username;

          const days = daysUntil(project.project_deadline);
          if (days !== null) {
            if (days < 0) {
              section.classList.add("deadline-overdue");
              dateEl.classList.add("deadline-overdue");
            } else if (days <= 7) {
              // within 7 days -> amber for projects
              section.classList.add("deadline-warning");
              dateEl.classList.add("deadline-warning");
            }
          }

          linkEl.href = `/${encodeURIComponent(username)}/projects/${encodeURIComponent(project.project_id)}`;
          linkEl.textContent = "Go to project";
          const li = document.createElement("li");
          li.className = "project-list-item";

          if (section.classList.contains("deadline-overdue")) {
            li.classList.add("deadline-overdue");
          } else if (section.classList.contains("deadline-warning")) {
            li.classList.add("deadline-warning");
          }

          li.appendChild(section);
          projectsList.appendChild(li);
        }
      });
    }

    // Event to open dialog when user clicks 'create new project'
    createProjectBtn.addEventListener("click", () => {
      dialog.showModal();
    });

    // Event to close dialog when you click the "X" on the dialog
    closeCreateNewFormButton.addEventListener("click", () => {
      dialog.close();
    });

    // Event to close dialog box when clicking anywhere outside the form
    dialog.addEventListener("click", function (e) {
      if (e.target === this) this.close();
    });

    // Event listener to add project
    dialogForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      dialog.close();

      loading.style.display = "flex";

      const form = e.target;
      const name = form["project-name"].value;
      const deadline = form["project-deadline"].value;

      const deadlineDate = new Date(deadline);

      if (deadlineDate <= new Date()) {
        alert("Project not created: Deadline must be in the future!");
        loading.style.display = "none";
        return;
      }

      const res = await fetch("/api/projects/addProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: name,
          project_deadline: deadline,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          document.querySelector("#create-project-dialog").close();
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

      loading.style.display = "none";
    });
  } catch (err) {
    console.error("Error loading projects page:", err);
    if (projectsList)
      projectsList.innerHTML = "<li>Error loading projects.</li>";
  }

  // Hide loading screen
  loading.style.display = "none";
}

projects();

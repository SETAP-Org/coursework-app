import { daysUntil } from "./utils.js";

const URGENCY_CLASSES = {
  OVERDUE: "deadline-overdue",
  WARNING: "deadline-warning",
};

// Apply urgency styling to a project card and its list item
function applyUrgencyClasses(section, li, days) {
  if (days === null) return;

  const urgencyClass =
    days < 0
      ? URGENCY_CLASSES.OVERDUE
      : days <= 7
        ? URGENCY_CLASSES.WARNING
        : null;

  if (urgencyClass) {
    section.classList.add(urgencyClass);
    li.classList.add(urgencyClass);
    // Also apply to date element for additional styling
    section.querySelector(".project-date")?.classList.add(urgencyClass);
  }
}

/**
 * Renders a single project card and appends it to the projects list
 */
function renderProjectCard(project, template, username, projectsList) {
  const node = template.content.cloneNode(true);
  const section = node.querySelector(".user-dash-project-card-individual");

  if (!section) return;

  const titleEl = section.querySelector(".project-name");
  const dateEl = section.querySelector(".project-date");
  const creatorEl = section.querySelector(".project-creator");
  const linkEl = section.querySelector("a.project-dash-button");

  // Format the due date
  const dueDate = new Date(project.project_deadline);
  const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Populate card elements
  titleEl.textContent = project.project_name;
  dateEl.textContent = formattedDueDate;
  creatorEl.textContent = project.creator_username;
  linkEl.href = `/${encodeURIComponent(username)}/projects/${encodeURIComponent(project.project_id)}`;
  linkEl.textContent = "Go to project";

  // Apply urgency styling based on days until deadline
  const days = daysUntil(project.project_deadline);
  const li = document.createElement("li");
  li.className = "project-list-item";

  applyUrgencyClasses(section, li, days);

  li.appendChild(section);
  projectsList.appendChild(li);
}

async function userDash() {
  // Show loading screen
  const loading = document.querySelector(".loading");
  loading.style.display = "flex";

  // Extract EJS data
  const { username } = window.scriptData;
  const projects = window.scriptData.projects;

  // Get relevant DOM elements
  const projectsList = document.querySelector(".projects-list");
  const template = document.querySelector("#project-template");

  try {
    if (projects.length === 0) {
      projectsList.innerHTML = "<li>No projects found.</li>";
    } else {
      // Only show first 5 projects
      projects.slice(0, 5).forEach((project) => {
        renderProjectCard(project, template, username, projectsList);
      });
    }
  } catch (err) {
    console.error("Error loading user projects:", err);
    projectsList.innerHTML =
      '<li class="project-list-item">Error loading projects.</li>';
  }

  // Hide loading screen
  loading.style.display = "none";
}

userDash();

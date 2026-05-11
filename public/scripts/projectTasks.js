// Imports
import { daysUntil } from "./utils.js";
// Initialise sockets for notifications
const socket = io();

// Keep a single consolidated reference to data injected by the server (EJS)
const SD = window.scriptData || {};
// Destructure commonly used values (tasks kept on SD so updates persist)
const { username, projectName } = SD;

// Toggles the dialog window (popup) to create a task
function toggleNewTaskForm() {
  const dialog = document.querySelector("#create-task-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

window.toggleNewTaskForm = toggleNewTaskForm;

// Function to run when page loads to draw all tasks
function showTasks() {
  const tasks = SD.tasks || [];
  const groupUsers = SD.groupUsers || [];
  const user_id = SD.userId;
  const teamLeaderId = SD.teamLeaderId;

  const main_list = document.querySelector("#task-list");
  const template = document.querySelector("#task-template");

  // If required DOM is missing, nothing to render
  if (!main_list || !template) return;

  main_list.innerHTML = "";

  // If no tasks exist
  if (tasks.length === 0) {
    main_list.innerHTML = "No tasks yet!";
    return;
  }

  // Generate map of user_id's in project to their respective usernames
  const userMap = new Map(
    (groupUsers || []).map((u) => [u.user_id, u.username]),
  );

  // Sorting tasks by closest deadline first (all completed tasks go after incomplete ones)
  const statusPriority = (status) =>
    String(status || "").toLowerCase() === "completed" ? 1 : 0;

  const sorted = [...tasks].sort((a, b) => {
    const sa = statusPriority(a.task_status);
    const sb = statusPriority(b.task_status);
    if (sa !== sb) return sa - sb;

    const da = new Date(a.task_deadline || 0).getTime();
    const db = new Date(b.task_deadline || 0).getTime();
    return da - db;
  });

  // Iterate over the tasks, drawing each one on the screen using the template
  sorted.forEach((task) => {
    const node = template.content.cloneNode(true);
    const section = node.querySelector(".task-card-individual");
    if (!section) return; // template not as expected

    const taskTitle = section.querySelector(".task-name");
    const taskDescription = section.querySelector(".task-desc");
    const weightEl = section.querySelector(".task-weight");
    const taskDeadline = section.querySelector(".task-date");
    const taskAssignee = section.querySelector(".task-assignee");
    const checkbox = section.querySelector(".task-complete-checkbox");
    const deleteBtn = section.querySelector(".task-delete-button");

    const days = daysUntil(task.task_deadline);

    const deadline = new Date(task.task_deadline || null);
    const formatted_deadline = isNaN(deadline)
      ? "No deadline"
      : deadline.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });

    taskTitle.textContent = task.task_title || "";
    taskDescription.textContent = task.task_description || "";
    taskDeadline.textContent = formatted_deadline;
    taskAssignee.textContent = userMap.get(task.assignee_id) || "Unknown";

    // Draw task weight as bubble in top left of task card
    if (weightEl) {
      weightEl.textContent = String(task.task_weight ?? "");
      weightEl.title = `Weight: ${task.task_weight ?? ""}`;
      weightEl.dataset.weight = String(task.task_weight ?? "");
      weightEl.style.display = ""; // ensure visible
    }

    // If the current user belongs to the task, also draw tickbox in top right
    if (task.assignee_id === user_id && checkbox) {
      checkbox.style.display = "inline-block";
      checkbox.dataset.taskId = task.task_id;
      checkbox.checked = task.task_status === "Completed";
      checkbox.disabled = false;
    } else if (checkbox) {
      checkbox.style.display = "none";
      checkbox.disabled = true;
    }

    // Show delete button only for team leader
    if (String(teamLeaderId) === String(user_id) && deleteBtn) {
      deleteBtn.style.display = ""; // visible
      deleteBtn.dataset.taskId = task.task_id;
    } else if (deleteBtn) {
      deleteBtn.style.display = "none";
    }

    // Apply completed style to any tasks that are already completed
    if (task.task_status === "Completed") {
      section.classList.add("task-completed");
    } else {
      section.classList.remove("task-completed");
    }

    // Apply correct styling for tasks close to their deadlines
    if (task.task_status !== "Completed" && days !== null) {
      if (days <= 0) {
        section.classList.add("deadline-overdue");
        taskDeadline.classList.add("deadline-overdue");
      } else if (days <= 1) {
        // within 1 day -> amber for tasks
        section.classList.add("deadline-warning");
        taskDeadline.classList.add("deadline-warning");
      }
    }

    const li = document.createElement("li");
    li.className = "task-list-item";
    li.appendChild(section);
    main_list.appendChild(li);
  });
}

// 'Free-floating' code
// Get DOM references and consolidate data
const createTaskDialog = document.querySelector("#create-task-dialog");
const dialogForm = document.querySelector("#create-task-dialog form");
const weightRange = document.getElementById("taskWeightRange");
const valueOutput = document.getElementById("taskWeightValue");
const taskListEl = document.querySelector("#task-list");

// Only draw create task button if current user is also the team leader
if (SD.teamLeaderId === SD.userId) {
  const newTaskBtn = document.querySelector("#new-task-button");
  if (newTaskBtn) newTaskBtn.addEventListener("click", toggleNewTaskForm);
}

// Close dialog window when clicking outside the dialog
if (createTaskDialog) {
  createTaskDialog.addEventListener("click", (e) => {
    if (e.target === createTaskDialog) createTaskDialog.close();
  });
}

// Ensure weight display matches range input
if (weightRange && valueOutput) {
  valueOutput.textContent = weightRange.value;
  weightRange.addEventListener("input", (e) => {
    valueOutput.textContent = e.target.value;
  });
}

// If there's no task list element, render tasks and exit if no form
if (!taskListEl) {
  showTasks();
  if (!dialogForm) {
    // nothing more to do
    // (no task list interactions on this page)
  }
}

// Small helper to fetch and parse JSON safely
async function requestJson(url, opts) {
  const res = await fetch(url, opts);
  try {
    const data = await res.json();
    return { res, data };
  } catch {
    return { res, data: {} };
  }
}

// Small helper to show server errors consistently
function showError(payload, fallback = "An unexpected error occurred.") {
  alert(payload?.error || fallback);
}

// Update local in-memory tasks list
function removeTaskFromLocal(taskId) {
  SD.tasks = SD.tasks || [];
  const idx = SD.tasks.findIndex((t) => String(t.task_id) === String(taskId));
  if (idx !== -1) SD.tasks.splice(idx, 1);
}

function updateTaskStatusLocal(taskId, status) {
  SD.tasks = SD.tasks || [];
  const idx = SD.tasks.findIndex((t) => String(t.task_id) === String(taskId));
  if (idx !== -1) SD.tasks[idx].task_status = status;
}

// Handle create-task form submission
if (dialogForm) {
  dialogForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      taskAssignee: form["taskAssignee"]?.value,
      taskTitle: form["taskTitle"]?.value,
      taskDesc: form["taskDesc"]?.value,
      taskWeight: form["taskWeight"]?.value,
      taskDeadline: form["taskDeadline"]?.value,
    };

    const deadlineDate = new Date(payload.taskDeadline);

    if (deadlineDate <= new Date()) {
      alert("Task not created: Deadline must be in the future!");
      return;
    }

    try {
      const { res, data } = await requestJson(
        `/api/tasks/${SD.projectId}/addTask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok && data.success) {
        // Notify assignee if it's not the creator
        if (payload.taskAssignee && payload.taskAssignee !== SD.userId) {
          socket.emit("notification", {
            targetUsers: [payload.taskAssignee],
            projectId: SD.projectId,
            notificationType: "Task",
            notificationMessage: `You have been assigned a task in ${projectName}`,
          });
        }

        // Close dialog and reset
        const dlg = document.getElementById("create-task-dialog");
        if (dlg) dlg.close();
        form.reset();

        // Redirect to project tasks view if we have both username and project id
        if (username && data.project?.project_id) {
          window.location.replace(
            `/${encodeURIComponent(username)}/projects/${encodeURIComponent(
              data.project.project_id,
            )}/tasks`,
          );
          return;
        }

        // Otherwise reload to pick up server-side changes
        window.location.reload();
      } else {
        showError(data, "Failed to create task.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("An unexpected error occurred creating the task.");
    }
  });
}

// Delegated listeners for task list interactions (delete + status change)
if (taskListEl) {
  // Delete handling on click (delegated)
  taskListEl.addEventListener("click", async (e) => {
    const del = e.target.closest(".task-delete-button");
    if (!del) return;

    if (!window.confirm("Delete this task? This cannot be undone.")) return;

    const taskId = del.dataset.taskId;
    const proj = SD.projectId;
    if (!taskId || !proj) {
      alert("Missing task or project id.");
      return;
    }

    del.disabled = true;
    try {
      const { res, data } = await requestJson(
        `/api/projects/${encodeURIComponent(proj)}/tasks/${encodeURIComponent(taskId)}`,
        { method: "DELETE" },
      );

      if (res.ok && data.success) {
        removeTaskFromLocal(taskId);
        showTasks();
      } else {
        showError(data, "Failed to delete task.");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("An unexpected error occurred deleting the task.");
    } finally {
      del.disabled = false;
    }
  });

  // Status update handling on change (delegated)
  taskListEl.addEventListener("change", async (e) => {
    const cb = e.target.closest(".task-complete-checkbox");
    if (!cb) return;

    const taskId = cb.dataset.taskId;
    const proj = SD.projectId;
    if (!taskId || !proj) {
      alert("Missing task or project id.");
      return;
    }

    cb.disabled = true;
    const newStatus = cb.checked ? "Completed" : "To Do";

    try {
      const { res, data } = await requestJson(
        `/api/projects/${encodeURIComponent(proj)}/tasks/${encodeURIComponent(taskId)}/updateStatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskStatus: newStatus }),
        },
      );

      if (res.ok && data.success) {
        updateTaskStatusLocal(taskId, newStatus);
        showTasks();
      } else {
        cb.checked = !cb.checked; // revert
        showError(data, "Failed to update task status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      cb.checked = !cb.checked; // revert
      alert("An unexpected error occurred updating the task status.");
    } finally {
      cb.disabled = false;
    }
  });
}

// Initial render
showTasks();

function toggleNewTaskForm() {
  const dialog = document.getElementById("create-task-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateString);
  d.setHours(0, 0, 0, 0);
  const diff = d - today;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function showTasks() {
  const tasks = window.scriptData.tasks || [];
  const groupUsers = window.scriptData.groupUsers || [];
  const user_id = window.scriptData.userId;
  const teamLeaderId = window.scriptData.teamLeaderId;

  const userMap = new Map(groupUsers.map((u) => [u.user_id, u.username]));

  const main_list = document.querySelector("#task-list");
  const template = document.querySelector("#task-template");

  main_list.innerHTML = "";

  if (tasks.length === 0) {
    main_list.innerHTML = "No tasks yet!";
    return;
  }

  // Status: "Completed" should sort last
  const statusPriority = (status) =>
    String(status).toLowerCase() === "completed" ? 1 : 0;

  const sorted = [...tasks].sort((a, b) => {
    const sa = statusPriority(a.task_status);
    const sb = statusPriority(b.task_status);
    if (sa !== sb) return sa - sb;

    const da = new Date(a.task_deadline).getTime();
    const db = new Date(b.task_deadline).getTime();
    return da - db;
  });

  sorted.forEach((task) => {
    const node = template.content.cloneNode(true);
    const section = node.querySelector(".task-card-individual");

    const taskTitle = section.querySelector(".task-name");
    const taskDescription = section.querySelector(".task-desc");
    const weightEl = section.querySelector(".task-weight");
    const taskDeadline = section.querySelector(".task-date");
    const taskAssignee = section.querySelector(".task-assignee");
    const checkbox = section.querySelector(".task-complete-checkbox");
    const deleteBtn = section.querySelector(".task-delete-button");

    const days = daysUntil(task.task_deadline);

    const deadline = new Date(task.task_deadline);
    const formatted_deadline = deadline.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    taskTitle.textContent = task.task_title;
    taskDescription.textContent = task.task_description;
    taskDeadline.textContent = formatted_deadline;
    taskAssignee.textContent = userMap.get(task.assignee_id) || "Unknown";

    if (weightEl) {
      weightEl.textContent = String(task.task_weight);
      weightEl.title = `Weight: ${task.task_weight}`;
      weightEl.dataset.weight = String(task.task_weight);
      weightEl.style.display = ""; // ensure visible
    }

    if (task.assignee_id === user_id) {
      checkbox.style.display = "inline-block";
      checkbox.dataset.taskId = task.task_id;
      checkbox.checked = task.task_status === "Completed";
      checkbox.disabled = false;
    } else {
      checkbox.style.display = "none";
      checkbox.disabled = true;
    }

    // Show delete button only for team leader
    if (String(teamLeaderId) === String(user_id)) {
      deleteBtn.style.display = ""; // visible
      deleteBtn.dataset.taskId = task.task_id;
    } else {
      deleteBtn.style.display = "none";
    }

    if (task.task_status === "Completed") {
      section.classList.add("task-completed");
    } else {
      section.classList.remove("task-completed");
    }

    if (task.task_status !== "Completed" && days !== null) {
      if (days < 0) {
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

const teamLeaderId = window.scriptData.teamLeaderId;
const userId = window.scriptData.userId;

if (teamLeaderId === userId) {
  const newTaskBtn = document.querySelector("#new-task-button");
  if (newTaskBtn) {
    newTaskBtn.addEventListener("click", toggleNewTaskForm);
  }
}

const createTaskDialog = document.querySelector("#create-task-dialog");
if (createTaskDialog) {
  createTaskDialog.addEventListener("click", function (e) {
    if (e.target === this) this.close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Elements and data queried after DOM is ready
  const dialogForm = document.querySelector("#create-task-dialog form");
  const { username } = window.scriptData || {};

  // Weight range UI
  const weightRange = document.getElementById("taskWeightRange");
  const valueOutput = document.getElementById("taskWeightValue");

  if (weightRange && valueOutput) {
    // Ensure initial displayed value matches the input value
    valueOutput.textContent = weightRange.value;

    // Update as the user moves the slider
    weightRange.addEventListener("input", (e) => {
      valueOutput.textContent = e.target.value;
    });
  }

  // If there's no form on this page, nothing more to do
  if (!dialogForm) return;

  dialogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const title = form["taskTitle"]?.value;
    const description = form["taskDesc"]?.value;
    const deadline = form["taskDeadline"]?.value;
    const weight = form["taskWeight"]?.value;
    const assignee = form["taskAssignee"]?.value;

    try {
      const res = await fetch("/api/tasks/addTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskAssignee: assignee,
          taskTitle: title,
          taskDesc: description,
          taskWeight: weight,
          taskDeadline: deadline,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.success) {
          document.getElementById("create-task-dialog").close();
          form.reset();

          // Redirect only if we have a username and project id
          if (username && data.project?.project_id) {
            window.location.replace(
              `/${encodeURIComponent(username)}/projects/${encodeURIComponent(
                data.project.project_id,
              )}/tasks`,
            );
          } else {
            // Otherwise just reload the page
            window.location.reload();
          }
        } else {
          alert(data.error || "Failed to create task.");
        }
      } else {
        alert(data.error || "Failed to create task.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("An unexpected error occurred creating the task.");
    }
  });
});

document.querySelector("#task-list").addEventListener("change", async (e) => {
  const cb = e.target.closest(".task-complete-checkbox");
  if (!cb) return;

  const taskId = cb.dataset.taskId;
  const projectId = window.scriptData.projectId;
  if (!taskId || !projectId) {
    alert("Missing task or project id.");
    return;
  }

  // Optimistic UI: disable while updating
  cb.disabled = true;

  // decide new status
  const newStatus = cb.checked ? "Completed" : "To Do";

  try {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(
        projectId,
      )}/tasks/${encodeURIComponent(taskId)}/updateStatus`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskStatus: newStatus }),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      // Update the in-memory tasks list and re-render so sorting is recalculated
      const tasks = window.scriptData.tasks || [];
      const idx = tasks.findIndex((t) => String(t.task_id) === String(taskId));
      if (idx !== -1) {
        tasks[idx].task_status = newStatus;
      }

      // Re-render sorted list
      showTasks();
    } else {
      // server rejected; revert checkbox
      cb.checked = !cb.checked;
      alert(data.error || "Failed to update task status.");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    cb.checked = !cb.checked;
    alert("An unexpected error occurred updating the task status.");
  } finally {
    // Re-enable (safe even if the element was re-rendered)
    cb.disabled = false;
  }
});

// NEW: handle delete clicks via event delegation
document.querySelector("#task-list").addEventListener("click", async (e) => {
  const btn = e.target.closest(".task-delete-button");
  if (!btn) return;

  const confirmed = window.confirm("Delete this task? This cannot be undone.");
  if (!confirmed) return;

  const taskId = btn.dataset.taskId;
  const projectId = window.scriptData.projectId;
  if (!taskId || !projectId) {
    alert("Missing task or project id.");
    return;
  }

  btn.disabled = true;

  try {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
      },
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      // Remove task from in-memory list and re-render
      const tasks = window.scriptData.tasks || [];
      const idx = tasks.findIndex((t) => String(t.task_id) === String(taskId));
      if (idx !== -1) {
        tasks.splice(idx, 1);
      }
      showTasks();
    } else {
      alert(data.error || "Failed to delete task.");
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    alert("An unexpected error occurred deleting the task.");
  } finally {
    btn.disabled = false;
  }
});

showTasks();

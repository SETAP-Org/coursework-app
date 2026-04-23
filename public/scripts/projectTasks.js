function toggleNewTaskForm() {
  const dialog = document.getElementById("create-task-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

function showTasks() {
  const tasks = window.scriptData.tasks || [];
  const groupUsers = window.scriptData.groupUsers || [];
  const user_id = window.scriptData.userId;

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
    const taskDeadline = section.querySelector(".task-date");
    const taskAssignee = section.querySelector(".task-assignee");
    const checkbox = section.querySelector(".task-complete-checkbox");

    const deadline = new Date(task.task_deadline);
    const formatted_deadline = deadline.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    taskTitle.textContent = task.task_title;
    taskDescription.textContent = task.task_description;
    taskDeadline.textContent = formatted_deadline;
    taskAssignee.textContent = userMap.get(task.assignee_id) || "Unknown";

    if (task.assignee_id === user_id) {
      checkbox.style.display = "inline-block";
      checkbox.dataset.taskId = task.task_id;
      checkbox.checked = task.task_status === "Completed";
      checkbox.disabled = false;
    } else {
      checkbox.style.display = "none";
      checkbox.disabled = true;
    }

    if (task.task_status === "Completed") {
      section.classList.add("task-completed");
    } else {
      section.classList.remove("task-completed");
    }

    const li = document.createElement("li");
    li.className = "task-list-item";
    li.appendChild(section);
    main_list.appendChild(li);
  });
}

document
  .querySelector("#new-task-button")
  .addEventListener("click", toggleNewTaskForm);

document
  .querySelector("#create-task-dialog")
  .addEventListener("click", function (e) {
    if (e.target === this) this.close();
  });

document.addEventListener("DOMContentLoaded", () => {
  // Elements and data queried after DOM is ready
  const dialogForm = document.querySelector("#create-task-dialog form");
  const loading = document.querySelector(".loading");
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

    if (loading) loading.style.display = "flex";

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
    } finally {
      if (loading) loading.style.display = "none";
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

showTasks();

function toggleNewTaskForm() {
  const dialog = document.getElementById("create-task-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
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
              `/${encodeURIComponent(username)}/projects/${encodeURIComponent(data.project.project_id)}/tasks`,
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

function showTasks() {
  const tasks = window.scriptData.tasks;
  const groupUsers = window.scriptData.groupUsers;

  const userMap = new Map(groupUsers.map((u) => [u.user_id, u.username]));

  const main_list = document.querySelector("#task-list");
  const template = document.querySelector("#task-template");

  if (tasks.length === 0) {
    main_list.innerHTML = "No tasks yet!";
  } else {
    tasks.forEach((task) => {
      const node = template.content.cloneNode(true);
      // find section within template that contains the dom content to alter
      const section = node.querySelector(".task-card-individual");

      const taskTitle = section.querySelector(".task-name");
      const taskDescription = section.querySelector(".task-desc");
      const taskDeadline = section.querySelector(".task-date");
      const taskAssignee = section.querySelector(".task-assignee");

      const deadline = new Date(task.task_deadline);
      const formatted_deadline = deadline.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      taskTitle.textContent = task.task_title;
      taskDescription.textContent = task.task_description;
      taskDeadline.textContent = formatted_deadline;
      taskAssignee.textContent = userMap.get(task.assignee_id);

      const li = document.createElement("li");
      li.className = "task-list-item";
      li.appendChild(section);
      main_list.appendChild(li);
    });
  }
}

showTasks();

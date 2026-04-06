async function addLink() {
  const userDataJson = await fetch("/api/me");
  const userData = await userDataJson.json();
  const dbUserData = userData.dbUser;

  const redirectLink = document.querySelector("#project-link");

  redirectLink.href = `/${dbUserData.username}/projects/dummy`;
}

// addLink();

function toggleNewProjectForm() {
  const dialog = document.getElementById("create-project-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

document
  .getElementById("create-project-dialog")
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
      {
        method: "POST",
      },
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

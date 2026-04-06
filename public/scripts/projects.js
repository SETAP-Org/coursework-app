// async function addLink() {
//   const userDataJson = await fetch("/api/me");
//   const userData = await userDataJson.json();
//   const dbUserData = userData.dbUser;

//   const redirectLink = document.querySelector("#project-link");

//   redirectLink.href = `/${dbUserData.username}/projects/dummy`;
// }

function toggleNewProjectForm() {
  const dialog = document.getElementById("create-project-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

document.addEventListener("DOMContentLoaded", async () => {
  const page_title = document.querySelector("#page-title");
  try {
    const user_info_fetch = await fetch("/api/me");
    const user_info = await user_info_fetch.json();

    const user_first_name = user_info?.dbUser.user_first_name;

    page_title.textContent = `${user_first_name}'s Projects`;
  } catch {}
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

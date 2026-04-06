async function addLink() {
  const userDataJson = await fetch("/api/me");
  const userData = await userDataJson.json();
  const dbUserData = userData.dbUser;

  const redirectLink = document.querySelector("#project-link");

  redirectLink.href = `/${dbUserData.username}/projects/dummy`;
}

// addLink();

async function newProject() {}

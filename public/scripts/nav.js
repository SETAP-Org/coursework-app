async function userNav() {
  const userDataJson = await fetch("/api/me");
  const userData = await userDataJson.json();
  const dbUserData = userData.dbUser;

  const projectsBtn = document.querySelector("#projects-button");
  const profileBtn = document.querySelector("#profile-button");
  // const burger = document.querySelector("#nav-burger");

  projectsBtn.href = `/${dbUserData.username}/projects`;
  profileBtn.href = `/${dbUserData.username}/profile`;

  // burger.addEventListener("click", () => {
  //     var x = document.querySelector("#MyHeader");

  //     if (x.className === "Dashboard-header") {
  //         x.className += " responsive";
  //     } else {
  //         x.className = "Dashboard-header";
  //     }
  // })
}

userNav();

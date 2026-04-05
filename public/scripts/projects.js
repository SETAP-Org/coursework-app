async function addLink() {
    const userDataJson = await fetch("/api/me");
    const userData = await userDataJson.json();
    const dbUserData = userData.dbUser;

    console.log(dbUserData, 'this is the user data');

    const redirectLink = document.querySelector("#project-link");

    redirectLink.href = `/${dbUserData.username}/projects/dummy`
}

addLink();
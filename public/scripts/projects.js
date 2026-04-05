async function addLink() {
    const userDataJson = await fetch("/api/me");
    const userData = await userDataJson.json();

    const redirectLink = document.querySelector("#project-link");

    redirectLink.href = `/${userData.username}/projects/dummy`
}

addLink();
// show loading screen
const loading = document.querySelector(".loading");
loading.style.display = "flex";

const button = document.querySelector("button");

button.addEventListener("click", async () => {
  await fetch("/");
});

// hide loading screen
loading.style.display = "none";

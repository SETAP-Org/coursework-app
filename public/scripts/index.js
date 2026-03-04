const response = await fetch("/api/users/all");
const data = await response.json();

const myUl = document.querySelector("#myUl");
const myButton = document.querySelector("#clickMe");

for (const row of data.rows) {
    const newLi = document.createElement("li");
    newLi.textContent = row["user_email"];
    myUl.appendChild(newLi);
}

myButton.addEventListener("click", async () => {
    const response = await fetch("/api/users/postUser", { method: "POST" });
    const data = await response.json();
    const newLi = document.createElement("li");
    newLi.textContent = "Hello Baby";
    myUl.appendChild(newLi);
})
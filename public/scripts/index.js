const response = await fetch("/api/users/all");
const data = await response.json();

const myUl = document.querySelector("#myUl");

for (const row of data.rows) {
    const newLi = document.createElement("li");
    newLi.textContent = row["user_email"];
    myUl.appendChild(newLi);
}
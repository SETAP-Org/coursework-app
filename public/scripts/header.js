async function getHeader() {
  const response = await fetch("./Components/Header.html"); // use / for root-relative
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("site-header");
  if (!el) return;

  try {
    el.innerHTML = await getHeader();
  } catch (err) {
    console.error(err);
    el.innerHTML = "<p>Check header link in functions.js</p>";
  }
});


async function navFunction() {
    var x = document.getElementById("MyHeader");
    if (x.className === "Dashboard-header") {
      x.className += " responsive";
    } else {
      x.className = "Dashboard-header";
    }
  }
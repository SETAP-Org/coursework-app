// cookie management functions

// function that gets all the html code??
async function getCookies() {
    const response = await fetch("/Components/Cookies.html");
    if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
    return await response.text();
}

// function that creates a cookie
function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// function that returns the data of a specific cookie, otherwise null
function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key == name) return value;
    }
    return null;
}

// when dom loads, shows or hides the consent banner based on whether the accept cookie is present or not
document.addEventListener('DOMContentLoaded', async () => {
    // gets an element that is not in the file
    const el = document.getElementById("cookie-container");

    // will not run
    if (el) {
        try {
            el.innerHTML = await getCookies();
        } catch (err) {
            console.error("this file is in the same place as my sanity", err);
            el.innerHTML = "<p>check the link for the cookies</p>";
            return;
        }
    }

    // gets other elements
    const banner = document.getElementById("cookie-banner");
    const acceptAllBtn = document.getElementById("accept-all");
    const acceptEssentialBtn = document.getElementById("accept-essentials");

    if (!banner) return;

    const consent = getCookie("cookieConsent");

    banner.style.display = consent ? "none" : "block";

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener("click", () => {
            setCookie("cookieConsent", "all", 365)
            banner.style.display = "none";
        });
    }

    if (acceptEssentialBtn) {
        acceptEssentialBtn.addEventListener("click", () => {
            setCookie("cookieConsent", "essential", 365)
            banner.style.display = "none";
        });
    }
});
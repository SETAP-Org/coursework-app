// cookie management functions

import { getCookie, setCookie } from "../../utils/cookies";

// function that gets all the html code??
// async function getCookies() {
//     const response = await fetch("/Components/Cookies.html");
//     if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
//     return await response.text();
// }

// when dom loads, shows or hides the consent banner based on whether the accept cookie is present or not
document.addEventListener('DOMContentLoaded', async () => {
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
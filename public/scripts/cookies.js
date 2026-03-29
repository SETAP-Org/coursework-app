async function getCookies() {
    const response = await fetch("/Components/Cookies.html");
    if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
    return await response.text();
}

function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key == name) return value;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById("cookie-container");

    if (el) {
        try {
            el.innerHTML = await getCookies();
        } catch (err) {
            console.error("this file is in the same place as my sanity", err);
            el.innerHTML = "<p>check the link for the cookies</p>";
            return;
        }
    }

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
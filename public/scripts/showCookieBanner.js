// cookie management functions

// import { getCookie } from "../../utils/cookies";
function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key == name) return value;
    }
    return null;
}

// function that gets all the html code??
// async function getCookies() {
//     const response = await fetch("/Components/Cookies.html");
//     if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);
//     return await response.text();
// }

// when dom loads, shows or hides the consent banner based on whether the accept cookie is present or not
// document.addEventListener('DOMContentLoaded', async () => {
//     const el = document.getElementById("cookie-container");

//     // will not run
//     if (el) {
//         try {
//             el.innerHTML = await getCookies();
//         } catch (err) {
//             console.error("this file is in the same place as my sanity", err);
//             el.innerHTML = "<p>check the link for the cookies</p>";
//             return;
//         }
//     }

//     // gets other elements
//     const banner = document.getElementById("cookie-banner");
//     const acceptAllBtn = document.getElementById("accept-all");
//     const acceptEssentialBtn = document.getElementById("accept-essentials");

//     if (!banner) return;

//     const consent = getCookie("cookieConsent");

//     banner.style.display = consent ? "none" : "block";

//     if (acceptAllBtn) {
//         acceptAllBtn.addEventListener("click", () => {
//             setCookie("cookieConsent", "all", 365)
//             banner.style.display = "none";
//         });
//     }

//     if (acceptEssentialBtn) {
//         acceptEssentialBtn.addEventListener("click", () => {
//             setCookie("cookieConsent", "essential", 365)
//             banner.style.display = "none";
//         });
//     }
// });

async function showCookieBannerIfNeeded() {
    const consent = getCookie("cookieConsent");
    if (!consent) {
        const response = await fetch("/components/cookieBanner.html");
        if (!response.ok) throw new Error("Failed to load cookie banner");
        
        const html = await response.text();

        // Create a temporary container to parse the html
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Append all child nodes to the body
        while (temp.firstChild) {
            const node = temp.firstChild;

            if (node.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                if (node.src) script.src = node.src;
                if (node.defer) script.defer = true;
                document.body.appendChild(script);
                temp.removeChild(node);
            } else {
                document.body.appendChild(node);
            }
        }
    }
}

showCookieBannerIfNeeded();
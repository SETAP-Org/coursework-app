import { setCookie } from "../../utils/cookies";

const acceptAllBtn = document.querySelector("#accept-all");
const acceptEssentialBtn = document.querySelector("#accept-essential");
const banner = document.getElementById("cookie-banner");

acceptAllBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "all", 365);
    banner.remove();
});

acceptEssentialBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "essential", 365);
    banner.remove();
});
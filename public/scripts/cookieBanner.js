function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const acceptAllBtn = document.querySelector("#accept-all");
const acceptEssentialBtn = document.querySelector("#accept-essential");
const banner = document.querySelector("#cookie-banner");

acceptAllBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "all", 365);
    banner.remove();
});

acceptEssentialBtn.addEventListener("click", () => {
    setCookie("cookieConsent", "essential", 365);
    banner.remove();
});
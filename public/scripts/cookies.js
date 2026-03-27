async function getCookies() {
    const response = await fetch("/Components/Cookies.html");
    if (!response.ok) throw new Error (`HTTP error status: ${response.status}`);
    return await response.text();
}


document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById("cookie-container");
    if (!el) return;

    try {
        el.innerHTML = await getCookies();
    } catch (err) {
        console.log(err)
        el.innerHTML = "<p>check the link for the cookies</p>"
    }
})


document.addEventListener("DOMContentLoaded", function() {
    const banner = document.getElementById("cookie-banner");
    const acceptAllBtn = document.getElementById("accept-all");  
    const acceptEssentialBtn = document.getElementById("accept-essential")

    const consent = localStorage.getItem('cookieConsent');

    if (consent == null){
        banner.style.display = "block";
    }

    if (!consent) {
        banner.style.display = "block";
    }

    acceptAllBtn.addEventListner("click", function(){
        localStorage.setItem("cookieConsent", "all");
        banner.style.display = "none";
    });

    acceptEssentialOnly.addEventListner("click", function() {
        localStorage.setItem("cookieConsent", "essential");
        banner.style.display = "none";
    });
})

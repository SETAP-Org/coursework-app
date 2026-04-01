// function to get the contents of a cookie
function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key == name) return value;
    }
    return null;
}

// function to display banner component if cookies have not been accepted
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
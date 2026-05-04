// function to format time given from message in database (timestamp has to be of type timestamptz)
export function formatTime(timestamp) {
    const date = new Date(timestamp);
    const localDate = date.toLocaleString("en-UK", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const splitDate = localDate.split(", ")[0];
    const splitTime = localDate.split(", ")[1].split(":");
    const formattedTime = `${splitTime[0]}:${splitTime[1]}`;

    return {
        date: splitDate,
        time: formattedTime,
    }
}

// Function to get number of days between given date and current date
export function daysUntil(dateString) {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateString);
    d.setHours(0, 0, 0, 0);
    const diff = d - today;
    return Math.round(diff / (1000 * 60 * 60 * 24));
}

// function to set a cookie in the browser
export function setCookie(name, value) {
    if(!name || !value) return;
    document.cookie = name + "=" + value + "; path=/";
}

// function to get a cookie from the browser or null if no cookie exists
export function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    
    return null;
}

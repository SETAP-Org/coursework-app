export function setCookie(name, value, days) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key == name) return value;
    }
    return null;
}
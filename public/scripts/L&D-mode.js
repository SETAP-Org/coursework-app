function setCookie(name, value) {
    if(!name || !value) return;
    document.cookie = name + "=" + value + "; path=/";
}

function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies){
        const [key, value] = cookie.split("=");
        if (key === name) {
            return value;
        }
    }
    
    return null;
}

function changeTheme() {
    const currentTheme = getCookie("theme");
    if (currentTheme === "dark") {
        setCookie("theme", "light");
    } else {
        setCookie("theme", "dark");
    }
    setTheme();
}


function setTheme (){
    const theme = getCookie("theme");
    const themeStyleSheet = document.getElementById("theme-stylesheet");

    if (!themeStyleSheet) return;


    if (theme === "dark") {
        themeStyleSheet.href= "../css/root-dark.css";
    } else if (theme === "light") {
        themeStyleSheet.href= "../css/root-light.css";
    } else {
        themeStyleSheet.href= "../css/root-dark.css";
    }
}

if (!getCookie("theme")) {
    setCookie("theme", "dark");
}
setTheme();
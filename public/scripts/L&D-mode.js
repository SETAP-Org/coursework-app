import { getCookie, setCookie } from "/scripts/utils.js";

// show loading screen
const loading = document.querySelector(".loading");
loading.style.display = "flex";

// getting dom elements
const themeStyleSheet = document.querySelector("#theme-stylesheet");

// setting theme to dark if no theme set
if (!getCookie("theme")) setCookie("theme", "dark");

// getting the theme
const theme = getCookie("theme");

// assigning url to link tag for relevant theme
if (theme === "dark") themeStyleSheet.href= "/css/root-dark.css";
else if (theme === "light") themeStyleSheet.href= "/css/root-light.css";
else themeStyleSheet.href= "/css/root-dark.css";

// hide loading screen
loading.style.display = "none";
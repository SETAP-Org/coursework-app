import path from "path";
import { isLoggedIn } from "../utils/auth.js";
const __dirname = import.meta.dirname;

export function serveLanding(req, res) {
  res.sendFile(path.join(__dirname, "../public/pages", "index.html"));
}

export function serveUserDashboard(req, res) {
  isLoggedIn(req)
    ? res.sendFile(
        path.join(__dirname, "../public/pages/", "user_dashboard.html"),
      )
    : res.redirect("/");
}

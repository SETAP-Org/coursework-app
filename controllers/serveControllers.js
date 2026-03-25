import path from "path";
const __dirname = import.meta.dirname;

export function serveLanding(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages", "index.html"));
}

export function serveUserDashboard(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages/", "user_dashboard.html")
  )
}

export function redirectUserDashboard(req, res, next) {
  res.redirect("/user-dashboard");
}
import path from "path";
const __dirname = import.meta.dirname;

export function serveLanding(req, res) {
  res.sendFile(path.join(__dirname, "../public/pages", "index.html"));
}

export function serveUserDashboard(req, res) {
  if (req.user && req.user.accessToken) {
    res.sendFile(
      path.join(__dirname, "../public/pages", "user_dashboard.html"),
    );
  } else {
    res.redirect("/");
  }
}

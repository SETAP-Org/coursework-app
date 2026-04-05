import path from "path";
const __dirname = import.meta.dirname;

// serve files (added to navigation stack)
export function serveLanding(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages", "index.html")
  );
}

export function serveUserDash(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages/", "user_dash.html")
  )
}

export function serveProjectDash(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages/", "projects_dash.html")
  )
}

export function serveProfile(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages/", "profile.html")
  )
}

export function serveProjects(req, res, next) {
  res.sendFile(
    path.join(__dirname, "../public/pages", "projects.html")
  )
}

// redirects (not added to stack) (for when access to pages is unauthorised)
export function redirectUserDashboard(req, res, next) {
  res.redirect(`/${req.user.microsoftId}`);
  next();
}

// export function redirectProjectDashboard(req, res, next) {
//   res.redirect("/project-dash");
// }

// export function redirectProfile(req, res, next) {
//   res.redirect("/profile");
// }

export function redirectAddUser(req, res, next) {
  res.redirect("/api/users/addUser")
}

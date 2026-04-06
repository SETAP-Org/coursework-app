import path from "path";
import { getUserModel } from "../models/authModels.js";

const __dirname = import.meta.dirname;

// serve files (added to navigation stack)
export function serveLanding(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages", "index.html"));
}

export function serveUserDash(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages/", "user_dash.html"));
}

export function serveProfile(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages/", "profile.html"));
}

export function serveProjects(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages", "projects.html"));
}

export function serveProjectDash(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages/", "project_dash.html"));
}

// redirects (not added to stack) (for when access to pages is unauthorised)
export async function redirectUserDashboard(req, res, next) {
  const dbUserResult = await getUserModel(req.user.microsoftId);
  const dbUser = await dbUserResult.rows[0];

  res.redirect(`/${dbUser.username}`);
}

export function redirectAddUser(req, res, next) {
  res.redirect("/api/users/addUser");
}

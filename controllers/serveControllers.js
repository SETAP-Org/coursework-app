import path from "path";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

const __dirname = import.meta.dirname;

// serve files (added to navigation stack)
// export function serveLanding(req, res, next) {
//   res.sendFile(path.join(__dirname, "../public/pages", "index.html"));
// }

export async function serveLanding(req, res, next) {
  const cookieConsent = req.cookies.cookieConsent ? true : false

  res.render('landing', {
    cookieConsent: cookieConsent,
  })
}

export function serveWelcome(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages", "welcome.html"));
}

export function serveUserDash(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages/", "user_dash.html"));
}

export async function serveProfile(req, res, next) {
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  res.render('profile', {
    name: dbUser.username,
  })
}

export function serveProjects(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages", "projects.html"));
}

export function serveProjectDash(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/pages/", "project_dash.html"));
}

// redirects (not added to stack) (for when access to pages is unauthorised)
export async function redirectUserDash(req, res, next) {
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  res.redirect(`/${dbUser.username}`);
}

export async function redirectWelcome(req, res, next) {
  res.redirect('/welcome');
}

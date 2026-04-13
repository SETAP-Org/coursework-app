import { getUserByMicrosoftIdModel } from "../models/userModels.js";

const __dirname = import.meta.dirname;

export function serveLanding(req, res, next) {
  const cookieConsent = req.cookies.cookieConsent ? true : false;

  res.render("landing", {
    cookieConsent: cookieConsent,
  });
}

export function serveWelcome(req, res, next) {
  res.render("welcome");
}

export function serveUserDash(req, res, next) {
  res.render("userDash", {
    name: req.user.firstName,
  });
}

export async function serveProfile(req, res, next) {
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  res.render("profile", {
    name: dbUser.username,
  });
}

export async function serveProjects(req, res, next) {
  res.render("projects", {
    name: req.user.firstName,
  });
}

export async function serveProjectDash(req, res, next) {
  res.render("projectDash", {
    name: req.user.firstName,
    username: req.params.username,
    project: req.project,
    project_name: req.project.project_name,
    project_id: req.project.project_id,
    overview_link: `/${req.params.username}/projects/${req.project.project_id}/overview`,
  });
}

export async function serveProjectOverview(req, res, next) {
  res.render("projectOverview", {
    username: req.params.username,
    project_id: req.project.project_id,
    project_name: req.project.project_name,
    overview_link: `/${req.params.username}/projects/${req.project.project_id}/overview`,
  });
}

// redirects (not added to stack) (for when access to pages is unauthorised)
export async function redirectUserDash(req, res, next) {
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  res.redirect(`/${dbUser.username}`);
}

export async function redirectWelcome(req, res, next) {
  res.redirect("/welcome");
}

import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import { getProjectByIdModel, getUserProjectsModel } from "../models/projectModels.js";
import { getMessagesByProjectIdModel } from "../models/chatModels.js";
import { getUsersByProjectId } from "../models/userProjectModels.js";

const __dirname = import.meta.dirname;

export function serveLanding(req, res, next) {
  const cookieConsent = req.cookies.cookieConsent ? true : false;

  res.render("landing", {
    cookieConsent: cookieConsent,
  });
}

export function serveError(req, res, next) {
  res.render("error");
}

export function serveWelcome(req, res, next) {
  res.render("welcome");
}

export async function serveUserDash(req, res, next) {
  // get the user details
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  // get projects related to user
  const projectsResponse = await getUserProjectsModel(dbUser.user_id);
  const projectsData = projectsResponse.rows;

  res.render("userDash", {
    userFirstName: req.user.firstName,
    username: req.params.username,
    projects: projectsData,
  });
}

export async function serveProfile(req, res, next) {
  res.render("profile", {
    userFirstName: req.user.firstName,
    username: req.params.username,
  });
}

export async function serveProjects(req, res, next) {
  // get the user details
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  // get projects related to user
  const projectsResponse = await getUserProjectsModel(dbUser.user_id);
  const projectsData = projectsResponse.rows;

  res.render("projects", {
    userFirstName: req.user.firstName,
    username: req.params.username,
    projects: projectsData,
  });
}

export async function serveProjectDash(req, res, next) {
  res.render("projectDash", {
    name: req.user.firstName,
    username: req.params.username,
    project: req.session.project,
    projectName: req.session.project.project_name,
    projectId: req.session.project.project_id,
  });
}

export async function serveProjectInformation(req, res, next) {
  res.render("projectInformation", {
    username: req.params.username,
    projectId: req.session.project.project_id,
    projectName: req.session.project.project_name,
  });
}

export async function serveProjectTasks(req, res, next) {
  res.render("projectTasks", {
    username: req.params.username,
    projectId: req.session.project.project_id,
    projectName: req.session.project.project_name,
  });
}

export async function serveProjectCalendar(req, res, next) {
  res.render("projectCalendar", {
    username: req.params.username,
    projectId: req.session.project.project_id,
    projectName: req.session.project.project_name,
  });
}

export async function serveProjectChat(req, res, next) {
  // get the user details
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  // get the project details
  const projectResponse = await getProjectByIdModel(req.params.project_id);
  const projectData = projectResponse.rows[0];

  // get project messages
  const messagesResponse = await getMessagesByProjectIdModel(req.params.project_id);
  const messagesData = messagesResponse.rows;

  // get the usernames of the other members of the group
  const groupUsersResponse = await getUsersByProjectId(req.params.project_id);
  const groupUsersData = groupUsersResponse.rows;

  res.render("projectChat", {
    userId: dbUser.user_id,
    username: req.params.username,
    projectId: req.params.project_id,
    projectName: projectData.project_name,
    messages: messagesData,
    groupUsers: groupUsersData
  });
}

export async function serveProjectContributions(req, res, next) {
  res.render("projectContributions", {
    username: req.params.username,
    projectId: req.session.project.project_id,
    projectName: req.session.project.project_name,
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

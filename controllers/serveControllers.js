import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import {
  getProjectByIdModel,
  getUserProjectsModel,
} from "../models/projectModels.js";
import { getMessagesByProjectIdModel } from "../models/chatModels.js";
import { getUsersByProjectId } from "../models/userProjectModels.js";
import { getTasksByProjectIdModel } from "../models/taskModels.js";
import { getContributionsByProjectIdModel } from "../models/contributionModels.js";

export function serveLanding(req, res, next) {
  try {
    const cookieConsent = req.cookies.cookieConsent ? true : false;

    res.render("landing", {
      cookieConsent: cookieConsent,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export function serveWelcome(req, res, next) {
  try {
    res.render("welcome");
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveUserDash(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get projects related to user
    const projectsResponse = await getUserProjectsModel(dbUser.user_id);
    const projectsData = projectsResponse.rows;

    res.render("userDash", {
      userFirstName: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
      projects: projectsData,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProfile(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    res.render("profile", {
      userFirstName: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjects(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get projects related to user
    const projectsResponse = await getUserProjectsModel(dbUser.user_id);
    const projectsData = projectsResponse.rows;

    res.render("projects", {
      userFirstName: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
      projects: projectsData,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectDash(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectDash", {
      name: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
      project: req.session.project,
      projectName: req.session.project.project_name,
      projectId: req.session.project.project_id,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectInfo(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the project details
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const projectData = projectResponse.rows[0];

    // get the usernames of the other members of the group
    const groupUsersResponse = await getUsersByProjectId(req.params.project_id);
    const groupUsersData = groupUsersResponse.rows;

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectInfo", {
      userId: dbUser.user_id,
      username: req.params.username,
      projectId: req.params.project_id,
      projectName: projectData.project_name,
      creatorId: projectData.created_by,
      teamLeaderId: projectData.team_leader_id,
      projectDeadline: projectData.deadline,
      projectMembers: groupUsersData,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectTasks(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the usernames of the other members of the group
    const groupUsersResponse = await getUsersByProjectId(req.params.project_id);
    const groupUsersData = groupUsersResponse.rows;

    // get the project details
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const projectData = projectResponse.rows[0];

    // get all tasks for project
    const tasksResponse = await getTasksByProjectIdModel(req.params.project_id);
    const tasksData = tasksResponse.rows;

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectTasks", {
      userId: dbUser.user_id,
      username: req.params.username,
      userId: dbUser.user_id,
      projectId: req.params.project_id,
      teamLeaderId: projectData.team_leader_id,
      projectName: req.session.project.project_name,
      tasks: tasksData,
      groupUsers: groupUsersData,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectCalendar(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectCalendar", {
      username: req.params.username,
      userId: dbUser.user_id,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectChat(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the project details
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const projectData = projectResponse.rows[0];

    // get project messages
    const messagesResponse = await getMessagesByProjectIdModel(
      req.params.project_id,
    );
    const messagesData = messagesResponse.rows;

    // get the usernames of the other members of the group
    const groupUsersResponse = await getUsersByProjectId(req.params.project_id);
    const groupUsersData = groupUsersResponse.rows;

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectChat", {
      userId: dbUser.user_id,
      username: req.params.username,
      projectId: req.params.project_id,
      projectName: projectData.project_name,
      messages: messagesData,
      groupUsers: groupUsersData,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectNotes(req, res, next) {
  // get the user details
  const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
  const dbUser = dbUserResult.rows[0];

  const isTeamLeader =
  req.session.project &&
  req.session.project.team_leader_id === dbUser.user_id;

  res.render("projectDash", {
    name: req.user.firstName,
    username: req.params.username,
    userId: dbUser.user_id,
    project: req.session.project,
    project_id: req.session.project.project_id,
    project_name: req.session.project.project_name,
    isTeamLeader,
  });
}

export async function serveProjectContributions(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the contribution tasksData
    const contributionDataRaw = await getContributionsByProjectIdModel(
      req.session.project.project_id,
    );
    const contributionData = contributionDataRaw.rows[0];

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectContributions", {
      username: req.params.username,
      userId: dbUser.user_id,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
      contributionData: contributionData,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", {
      error: err,
    });
  }
}

export async function serveProjectFiles(req, res, next) {
  try {

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectFiles", {
      username: req.params.username,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
      isTeamLeader,
    });
  } catch (err) {
    res.render("error", { error: err });
  }
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

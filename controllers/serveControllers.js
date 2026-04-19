import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import { getProjectByIdModel, getUserProjectsModel } from "../models/projectModels.js";
import { getMessagesByProjectIdModel } from "../models/chatModels.js";
import { getUsersByProjectId } from "../models/userProjectModels.js";

const __dirname = import.meta.dirname;

export function serveLanding(req, res, next) {
  try {
    const cookieConsent = req.cookies.cookieConsent ? true : false;

    res.render("landing", {
      cookieConsent: cookieConsent,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export function serveWelcome(req, res, next) {
  try {
    res.render("welcome");
  } catch(err) {
    res.render("error", {
      error: err,
    })
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
      projects: projectsData,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export async function serveProfile(req, res, next) {
  try {
    res.render("profile", {
      userFirstName: req.user.firstName,
      username: req.params.username,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
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
      projects: projectsData,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export async function serveProjectDash(req, res, next) {
  try {
    res.render("projectDash", {
      name: req.user.firstName,
      username: req.params.username,
      project: req.session.project,
      projectName: req.session.project.project_name,
      projectId: req.session.project.project_id,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
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

    res.render("projectInfo", {
      userId: dbUser.user_id,
      username: req.params.username,
      projectId: req.params.project_id,
      projectName: projectData.project_name,
      creatorId: projectData.created_by,
      teamLeaderId: projectData.team_leader_id,
      projectDeadline: projectData.deadline,
      projectMembers: groupUsersData,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export async function serveProjectTasks(req, res, next) {
  try {
    res.render("projectTasks", {
      username: req.params.username,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export async function serveProjectCalendar(req, res, next) {
  try {
    res.render("projectCalendar", {
      username: req.params.username,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
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
  } catch(err) {
    res.render("error", {
      error: err,
    })
  }
}

export async function serveProjectContributions(req, res, next) {
  try {
    res.render("projectContributions", {
      username: req.params.username,
      projectId: req.session.project.project_id,
      projectName: req.session.project.project_name,
    });
  } catch(err) {
    res.render("error", {
      error: err,
    })
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

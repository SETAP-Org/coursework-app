import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import {
  getProjectByIdModel,
  getUserProjectsModel,
} from "../models/projectModels.js";
import { getMessagesByProjectIdModel } from "../models/chatModels.js";
import { getUsersByProjectId } from "../models/userProjectModels.js";
import { getTasksByProjectIdModel } from "../models/taskModels.js";
import { getContributionsByProjectIdModel } from "../models/contributionModels.js";
import { getCalendarEvents } from "../models/calendarModels.js";
import { getNotesByProjectId } from "../models/konvaModels.js";
import { getNotes } from "./konvaControllers.js";
import { getMeetingsByProjectIdModel } from "../models/meetingModels.js";

export function serveLanding(req, res, next) {
  try {
    const cookieConsent = req.cookies.cookieConsent ? true : false;

    res.render("landing", {
      cookieConsent: cookieConsent,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function serveWelcome(req, res, next) {
  try {
    if (!req.user) {
      res.redirect("/error");
    }

    if (req.session.justAuthenticated) {
      req.session.justAuthenticated = false;

      res.render("/welcome");
    } else if (req.user) {
      const dbUserResult = await getUserByMicrosoftIdModel(
        req.user.microsoftId,
      );

      if (dbUserResult.rows.length === 0) {
        res.redirect("/error");
      }

      const dbUser = dbUserResult.rows[0];

      res.redirect(`/${dbUser.username}`);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export function serveError(req, res, next) {
  const error = req.query.err;

  res.render("error", {
    error: error,
  });
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
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function serveProfile(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    console.log(dbUser, 'this is the user')

    res.render("profile", {
      userFirstName: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
      emailNotifications: dbUser.email_notifications,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
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
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function serveProjectDash(req, res) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;
    // get the project konva notes
    const notesResult = await getNotesByProjectId(req.params.project_id);
    const notes = notesResult.rows;

    // get project data
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const project = projectResponse.rows[0];

    const rawDeadline = project.project_deadline;
    let deadlineLabel = "No deadline set";

    if (rawDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadlineDate = new Date(rawDeadline);
      deadlineDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft > 0) {
        deadlineLabel = `${daysLeft} day${daysLeft > 1 ? "s" : ""} left until deadline`;
      } else if (daysLeft === 0) {
        deadlineLabel = "Deadline is today!";
      } else {
        const daysOverdue = Math.abs(daysLeft);
        deadlineLabel = `Deadline passed ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} ago`;
      }
    }

    res.render("projectDash", {
      name: req.user.firstName,
      username: req.params.username,
      userId: dbUser.user_id,
      isTeamLeader,
      notes: notes,
      project: project,
      projectName: project.project_name,
      projectId: project.project_id,
      deadlineLabel: deadlineLabel,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
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
    res.redirect("/error?err=" + encodeURIComponent(err));
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
      projectName: projectData.project_name,
      tasks: tasksData,
      groupUsers: groupUsersData,
      isTeamLeader,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function serveProjectCalendar(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the project details
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const project = projectResponse.rows[0];

    // get the usernames of the other members of the group
    const groupUsersResponse = await getUsersByProjectId(req.params.project_id);
    const groupUsersData = groupUsersResponse.rows;

    console.log(groupUsersData, 'these are the group users...')

    const isTeamLeader = project && project.team_leader_id === dbUser.user_id;

    // // get the calendar events
    // const events = await getCalendarEvents(req.user.accessToken);

    const meetings = await getMeetingsByProjectIdModel(req.params.project_id);

    res.render("projectCalendar", {
      username: req.params.username,
      userId: dbUser.user_id,
      isTeamLeader,
      project: project,
      projectId: project.project_id,
      projectName: project.project_name,
      // events: events.value,
      groupUsers: groupUsersData,
      meetings: meetings.rows,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
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
    res.redirect("/error?err=" + encodeURIComponent(err));
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
    projectId: req.session.project.project_id,
    projectName: req.session.project.project_name,
    isTeamLeader,
  });
}

export async function serveProjectContributions(req, res, next) {
  try {
    // get the user details
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get project details
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const project = projectResponse.rows[0];

    // get the contribution tasksData
    const contributionDataRaw = await getContributionsByProjectIdModel(
      project.project_id,
    );
    const contributionData = contributionDataRaw.rows[0];

    const isTeamLeader =
      req.session.project &&
      req.session.project.team_leader_id === dbUser.user_id;

    res.render("projectContributions", {
      username: req.params.username,
      userId: dbUser.user_id,
      projectId: project.project_id,
      projectName: project.project_name,
      contributionData: contributionData,
      isTeamLeader,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function serveProjectFiles(req, res, next) {
  try {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // get the project details from route params (do not rely on session state)
    const projectResponse = await getProjectByIdModel(req.params.project_id);
    const project = projectResponse.rows[0];

    const isTeamLeader = project.team_leader_id === req.params.user_id;

    res.render("projectFiles", {
      userId: req.params.user_id,
      username: req.params.username,
      projectId: project.project_id,
      projectName: project.project_name,
      isTeamLeader: isTeamLeader,
    });
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

// redirects (not added to stack) (for when access to pages is unauthorised)
export async function redirectUserDash(req, res, next) {
  try {
    if (!req.user || !req.user.microsoftId) {
      return res.redirect("/");
    }

    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);

    if (dbUserResult.rows === 0) {
      res.redirect("/");
    }

    const dbUser = dbUserResult.rows[0];

    res.redirect(`/${dbUser.username}`);
  } catch (err) {
    res.redirect("/error?err=" + encodeURIComponent(err));
  }
}

export async function redirectWelcome(req, res, next) {
  res.redirect("/welcome");
}

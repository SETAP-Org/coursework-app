// PAGE ROUTES
// All routes that serve a view

import { Router } from "express";

// Controller Imports
import {
  serveLanding,
  serveWelcome,
  serveError,
  serveUserDash,
  serveProjects,
  serveProfile,
  serveProjectDash,
  serveProjectInfo,
  serveProjectTasks,
  serveProjectCalendar,
  serveProjectChat,
  serveProjectContributions,
  serveProjectFiles,
} from "../controllers/serveControllers.js";

// Middleware Imports
import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  checkIfLoggedInCalendar,
} from "../controllers/authControllers.js";

import { checkMembership } from "../controllers/projectControllers.js";

// Router Declaration
const router = Router();

// Routes
// Basic  pages
router.get("/", checkIfLoggedIn, serveLanding);

router.get("/welcome", serveWelcome);

router.get("/error", serveError);

router.get("/:username", checkIfLoggedInRedirect, serveUserDash);

router.get("/:username/projects", checkIfLoggedInRedirect, serveProjects);

router.get("/:username/profile", checkIfLoggedInRedirect, serveProfile);

// Project pages
router.get(
  "/:username/projects/:project_id",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectDash,
);

router.get(
  "/:username/projects/:project_id/information",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectInfo,
);

router.get(
  "/:username/projects/:project_id/tasks",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectTasks,
);

router.get(
  "/:username/projects/:project_id/calendar",
  checkIfLoggedInCalendar,
  checkMembership,
  serveProjectCalendar,
);

router.get(
  "/:username/projects/:project_id/chat",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectChat,
);

router.get(
  "/:username/projects/:project_id/contributions",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectContributions,
);

router.get(
  "/:username/projects/:project_id/files",
  checkIfLoggedInRedirect,
  checkMembership,
  serveProjectFiles,
);

// Export router
export default router;

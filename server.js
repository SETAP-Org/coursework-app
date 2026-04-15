// ===== imports =====
// package imports
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// controller imports
import {
  serveLanding,
  serveWelcome,
  serveUserDash,
  serveProjectDash,
  serveProfile,
  serveProjects,
  serveProjectOverview,
  serveProjectTasks,
  serveProjectCalendar,
  serveProjectChat,
  serveProjectContributions,
  redirectWelcome,
} from "./controllers/serveControllers.js";

import {
  addProject,
  getUserProjects,
  getProjectDetails,
  loadProject,
  checkMembership,
} from "./controllers/projectControllers.js";

import {
  addUser,
  checkValidUsername,
  updateUsername,
  getCurrentUser,
} from "./controllers/userControllers.js";

import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  signOut,
  authenticatePassport,
  setJustAuthenticatedFlag,
  getJustAuthenticatedFlag,
} from "./controllers/authControllers.js";

import {
  addMessage,
  getMessages,
} from "./controllers/chatControllers.js";

// util imports
import createSession from "./utils/session.js";
import setUpAuth from "./utils/auth.js";

// configfure environment variables
dotenv.config({ path: ".env.auth" });

// configuration data for server
const __dirname = import.meta.dirname;
const app = express();
const port = 3000;

// middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
createSession(app);
setUpAuth(app);

// paths to navigate pages
app.get("/", checkIfLoggedIn, serveLanding);

app.get("/welcome", serveWelcome);

app.get("/:username", checkIfLoggedInRedirect, serveUserDash);

app.get("/:username/projects", checkIfLoggedInRedirect, serveProjects);

app.get("/:username/profile", checkIfLoggedInRedirect, serveProfile);

app.get(
  "/:username/projects/:project_id",
  checkIfLoggedInRedirect,
  loadProject, //Adds project details to req.session
  checkMembership, //Ensures user is member of the project
  serveProjectDash,
);

app.get(
  "/:username/projects/:project_id/overview",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectOverview,
);

app.get(
  "/:username/projects/:project_id/tasks",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectTasks,
);

app.get(
  "/:username/projects/:project_id/calendar",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectCalendar,
);

app.get(
  "/:username/projects/:project_id/chat",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectChat,
);

app.get(
  "/:username/projects/:project_id/contributions",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectContributions,
);

// API routes
// ---- CREATE ----
app.post("/api/projects/addProject", addProject);

app.post("/api/users/addUser", setJustAuthenticatedFlag, addUser);

app.post("/api/chat/addMessage", addMessage);

// ---- READ ----
app.get("/api/auth", checkIfLoggedIn, authenticatePassport());

app.get(
  "/api/auth/callback",
  authenticatePassport(),
  setJustAuthenticatedFlag,
  redirectWelcome,
);

app.get("/api/auth/signout", signOut, checkIfLoggedInRedirect);

app.get("/api/auth/justAuthenticated", getJustAuthenticatedFlag);

app.get("/api/me", getCurrentUser);

app.get("/api/me/projects", getUserProjects);

app.get("/api/projects/:project_id", getProjectDetails);

app.get("/api/chat", getMessages);

// ---- UPDATE ----
app.put("/api/users/changeUsername", checkValidUsername, updateUsername);

// ---- DELETE ----

// assigning the server to a port so that requests can be made
app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

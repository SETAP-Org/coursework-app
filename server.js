// ===== imports =====
// package imports
import express from "express";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// model imports
import { postMessageModel } from "./models/chatModels.js";

// controller imports
import {
  serveLanding,
  serveWelcome,
  serveUserDash,
  serveProjectDash,
  serveProfile,
  serveProjects,
  serveProjectInfo,
  serveProjectTasks,
  serveProjectCalendar,
  serveProjectChat,
  serveProjectContributions,
  redirectWelcome
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

import {
  removeUserFromProject,
} from "./controllers/userProjectControllers.js";

// util imports
import createSession from "./utils/session.js";
import setUpAuth from "./utils/auth.js";

// configfure environment variables
dotenv.config({ path: ".env.auth" });

// configuration data for server
const __dirname = import.meta.dirname;
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

// middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
createSession(app);
setUpAuth(app);

// socket io logic
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat', async (msg) => {
    const data = await postMessageModel(
      msg.senderId,
      msg.projectId,
      msg.message,
    );

    console.log(data, 'this is the data back.....')
    
    io.emit('chat', data.rows[0]);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

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
  "/:username/projects/:project_id/information",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectInfo,
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
app.delete("/api/projects/remove_user", removeUserFromProject);

// assigning the server to a port so that requests can be made
server.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

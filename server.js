// ===== imports =====
// package imports
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// model imports
import { postMessageModel } from "./models/chatModels.js";
import { postNotificationModel } from "./models/notificationModels.js";

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
  serveProjectNotes,
  serveProjectContributions,
  redirectWelcome,
} from "./controllers/serveControllers.js";

import {
  addProject,
  getUserProjects,
  getProjectDetails,
  loadProject,
  checkMembership,
  updateTeamLeader,
  removeProject,
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
  checkIfLoggedInCalendar,
  signOut,
  authenticatePassport,
  setJustAuthenticatedFlag,
  getJustAuthenticatedFlag,
} from "./controllers/authControllers.js";

import { addMessage, getMessages } from "./controllers/chatControllers.js";

import {
  addTask,
  getProjectTasks,
  updateTaskStatus,
} from "./controllers/taskControllers.js";

import {
  removeUserFromProject,
  addUserToProject,
} from "./controllers/userProjectControllers.js";
//konva controllers support
import {
  saveNote,
  deleteNote,
  getNotes,
} from "./controllers/KonvaController.js";

import {
  getEvent,
  addEvent,
  removeEvent,
} from './controllers/calendarController.js';

import {
  fetchNotificationsByUserId,
  // addNotification,
  removeNotification,
} from './controllers/notificationControllers.js';

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
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat", async (msg) => {
    const data = await postMessageModel(
      msg.senderId,
      msg.projectId,
      msg.message,
    );
    
    io.emit('chat', data.rows[0]);
  });

  socket.on('notification', async (notif) => {
    for (let i=0; i<notif.targetUsers.length; i++) {
      const data = await postNotificationModel(
        notif.targetUsers[i],
        notif.projectId,
        notif.notificationType,
        notif.notificationMessage,
      );
      console.log(data.rows, 'this was a notification that was created...')
    }
  
    io.emit('notification', notif);
  })

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// paths to navigate pages
app.get("/", checkIfLoggedIn, serveLanding);

app.get("/welcome", serveWelcome);

app.get("/:username", checkIfLoggedInRedirect, serveUserDash);

app.get("/:username/projects", checkIfLoggedInRedirect, serveProjects);

app.get("/:username/profile", checkIfLoggedInRedirect, serveProfile);

app.get( "/:username/projects/:project_id",
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

app.get( "/:username/projects/:project_id/tasks",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectTasks,
);

app.get( "/:username/projects/:project_id/calendar",
  checkIfLoggedInCalendar,
  loadProject,
  checkMembership,
  serveProjectCalendar,
);

app.get( "/:username/projects/:project_id/chat",
  checkIfLoggedInRedirect,
  loadProject,
  checkMembership,
  serveProjectChat,
);

app.get( "/:username/projects/:project_id/contributions",
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

app.post("/api/tasks/addTask", addTask);

app.post("/api/projects/user", addUserToProject);

// potentially dont need...
// app.post("/api/notifications", addNotification);

// ---- READ ----
// ---- API ROUTES FOR calandar EVENTS ----
app.get("/api/calendar/events", checkIfLoggedInCalendar, getEvent);

app.post("/api/calendar/events", checkIfLoggedInCalendar, addEvent);

app.delete("/api/calendar/events/:eventId", checkIfLoggedInCalendar, removeEvent);

// ---- API ROUTES FOR NOTES ----
app.post("/:username/projects/:project_id/save", checkIfLoggedInRedirect, loadProject, saveNote);

app.post("/:username/projects/:project_id/delete", checkIfLoggedInRedirect, loadProject, deleteNote);

app.get("/:username/projects/:project_id/notes", checkIfLoggedInRedirect, loadProject, getNotes);

app.get("/:username/projects/:project_id/:page", checkMembership, serveProjectNotes);

app.get("/:username/projects/:project_id", checkMembership, serveProjectDash);


//---- READ ----

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

app.get("/api/projects/:project_id/tasks", getProjectTasks);

app.get("/api/chat", getMessages);

app.get("/api/notifications/:user_id", fetchNotificationsByUserId);

// ---- UPDATE ----
app.put("/api/users/changeUsername", checkValidUsername, updateUsername);
app.put(
  "/api/projects/:project_id/tasks/:task_id/updateStatus",
  loadProject,
  checkMembership,
  updateTaskStatus,
);

app.put("/api/projects/leader", updateTeamLeader);

// ---- DELETE ----
app.delete("/api/projects/user", removeUserFromProject);

app.delete("/api/projects/:project_id", removeProject);

app.delete("/api/notifications/:notification_id", removeNotification);

// assigning the server to a port so that requests can be made
server.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

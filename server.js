// ===== imports =====
// package imports
import express from "express";
import path from "path";
import dotenv from "dotenv";

// controller imports
import {
  serveLanding,
  serveUserDash,
  serveProjectDash,
  serveProfile,
  serveProjects,
  redirectUserDashboard,
  redirectAddUser,
} from "./controllers/serveControllers.js";

import {
  addProject,
  getUserProjects,
  getProjectDetails,
} from "./controllers/projectControllers.js";

import {
  addUser,
  checkValidUsername,
  updateUsername,
  getCurrentUser
} from "./controllers/userControllers.js";

import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  signOut,
  authenticatePassport,
} from "./controllers/authControllers.js";

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
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
createSession(app);
setUpAuth(app);

// paths to navigate pages
app.get("/", checkIfLoggedIn, serveLanding);

app.get("/:username", checkIfLoggedInRedirect, serveUserDash);

app.get("/:username/projects", checkIfLoggedInRedirect, serveProjects);

app.get("/:username/profile", checkIfLoggedInRedirect, serveProfile);

app.get(
  "/:username/projects/:project_id",
  checkIfLoggedInRedirect,
  serveProjectDash,
);

// API routes
// ---- CREATE ----
app.post("/api/projects/addProject", addProject);

app.get("/api/users/addUser", addUser, redirectUserDashboard);

// ---- READ ----
// auth
app.get("/api/auth", checkIfLoggedIn, authenticatePassport());

app.get("/api/auth/callback", authenticatePassport(), redirectAddUser);

app.get("/api/auth/signout", signOut, checkIfLoggedInRedirect);

// other
app.get("/api/me", getCurrentUser);

app.get("/api/me/projects", getUserProjects);

app.get("/api/projects/:project_id", getProjectDetails);

// ---- UPDATE ----
app.put("/api/users/changeUsername", checkValidUsername, updateUsername);

// ---- DELETE ----

// assigning the server to a port so that requests can be made
app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

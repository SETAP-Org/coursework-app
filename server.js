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
  addUserController,
} from "./controllers/userControllers.js";
import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  signOut,
  authenticatePassport,
  getCurrentUser,
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

app.get("/:username/projects/dummy", checkIfLoggedInRedirect, serveProjectDash) // will later have to have checkIfValidProject middleware

app.get("/:username/profile", checkIfLoggedInRedirect, serveProfile);

// API routes
app.get("/api/auth", checkIfLoggedIn, authenticatePassport());

app.get("/api/auth/callback", authenticatePassport(), redirectAddUser);

app.get("/api/users/addUser", addUserController, redirectUserDashboard);

app.get("/api/auth/signout", signOut, checkIfLoggedInRedirect);

app.put("/api/users/changeUsername");

app.get("/api/me", getCurrentUser);

// assigning the server to a port so that requests can be made
app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

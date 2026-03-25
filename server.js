// ===== imports =====
// package imports
import express from "express";
import path from "path";
import dotenv from "dotenv";
import passport from "passport";

// controller imports
import {
  serveLanding,
  serveUserDashboard,  
  serveProjectDash,
  redirectUserDashboard,
  redirectAddUser
} from "./controllers/serveControllers.js";
import {
  getAllUsersController,
  addUserController,
} from "./controllers/userControllers.js";
import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  authenticatePassport,
} from "./controllers/authControllers.js";

// util imports
import createSession from "./utils/session.js";
import setUpAuth from "./utils/auth.js";

// configfure environment variables
dotenv.config({ path: ".env.auth" });

// ===== code =====
// server configuration
const __dirname = import.meta.dirname;
const app = express();
const port = 3000;

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
createSession(app);
setUpAuth(app);

// paths to navigate pages
app.get("/", serveLanding);

app.get("/user-dashboard", checkIfLoggedInRedirect, serveUserDashboard);

app.get("/project-dash", checkIfLoggedIn, serveProjectDash);

// API routes
app.get("/api/users/all", getAllUsersController);

app.get("/api/auth", checkIfLoggedIn, passport.authenticate("microsoft", { failureRedirect: "/" }));

app.get("/api/auth/callback", passport.authenticate("microsoft", { failureRedirect: "/" }), redirectAddUser);

app.get("/api/users/addUser", addUserController, redirectUserDashboard);

app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

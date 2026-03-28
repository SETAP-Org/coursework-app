// ===== imports =====
// package imports
import express from "express";
import path from "path";
import dotenv from "dotenv";

// controller imports
import {
  serveLanding,
  serveUserDashboard,  
  serveProjectDash,
  redirectUserDashboard,
} from "./controllers/serveControllers.js";
import {
  getAllUsersController,
  postUserController,
} from "./controllers/userControllers.js";
import {
  checkIfLoggedIn,
  checkIfLoggedInRedirect,
  authenticatePassport,
  getCurrentUser
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
app.get("/",checkIfLoggedIn, serveLanding);

app.get("/user-dashboard", checkIfLoggedInRedirect, serveUserDashboard);

app.get("/project-dash", checkIfLoggedInRedirect, serveProjectDash);

app.get("/api/me", checkIfLoggedInRedirect, getCurrentUser)

// API routes
app.get("/api/users/all", getAllUsersController);

app.post("/api/users/postUser", postUserController);

app.get("/api/auth", checkIfLoggedIn, authenticatePassport());

app.get("/api/auth/callback", authenticatePassport(), redirectUserDashboard);

app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

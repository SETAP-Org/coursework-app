import express from "express";
import path from "path";
import dotenv from "dotenv";

import {
  serveLanding,
  serveUserDashboard,
} from "./controllers/serveControllers.js";

import {
  getAllUsersController,
  postUserController,
} from "./controllers/userControllers.js";
import createSession from "./utils/session.js";
import { connectMicrosoft } from "./utils/auth.js";

import passport from "passport";

dotenv.config({ path: ".env.auth" });

const __dirname = import.meta.dirname;
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

createSession(app);
connectMicrosoft(app);

// paths to navigate pages
app.get("/", serveLanding);

app.get("/user-dashboard", serveUserDashboard);

// API routes
app.get("/api/users/all", getAllUsersController);

app.post("/api/users/postUser", postUserController);

app.get("/api/auth", passport.authenticate("microsoft"));

app.get(
  "/api/auth/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/user-dashboard");
  },
);

app.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});

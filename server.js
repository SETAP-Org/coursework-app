import express from "express";
import path from "path";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import "auth.js";

import { getAllUsersController, postUserController } from "./controllers/userControllers.js";

const __dirname = import.meta.dirname;

const app = express();

const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(session({
  secret: process.env.session.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// paths to navigate pages
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "index.html"));
});

app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "user_dashboard.html"));
});

app.listen(port, () => {
  console.log("Server running on http://localhost:3000/");
});

// API routes
app.get("/api/users/all", getAllUsersController)

app.post("/api/users/postUser", postUserController)
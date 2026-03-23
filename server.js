import express from "express";
import path from "path";
import session from "express-session";
import passport from "passport";
import dotenv from 'dotenv';
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { getAllUsersController, postUserController } from "./controllers/userControllers.js";

dotenv.config({path: ".env.auth"})
dotenv.config({path: ".env.session-secret"});

const __dirname = import.meta.dirname;
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

passport.use(new MicrosoftStrategy({
		clientID: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		callbackURL: "http://localhost:3000/api/auth/callback",
		scope: ["User.Read"]
	},
	function(accessToken, refreshToken, profile, done) {
		return done(null, profile);
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  const filteredUser = {
    microsoftId: user.id,
    firstName: user.name.givenName,
    lastName: user.name.familyName,
    email: user.emails[0].value
  }
  done(null, filteredUser);
});

passport.deserializeUser((obj, done) => {
  console.log(obj);
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

app.get("/api/auth", passport.authenticate("microsoft"));

app.get("/api/auth/callback", passport.authenticate("microsoft", {
    failureRedirect: "/"
  }),
  (req, res) => {
	res.redirect("/user-dashboard");
    console.log("Dummy Log");
  }
);

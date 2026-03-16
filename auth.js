import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import dotenv from 'dotenv';

dotenv.config({path: ".env.auth"})

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

import dotenv from "dotenv";
import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
const __dirname = import.meta.dirname;

dotenv.config({ path: ".env.auth" });

// function to set up passport package for microsoft sign in
export default function setUpAuth(app) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/callback",
        scope: ["User.Read"],
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, { accessToken, refreshToken, ...profile });
      },
    ),
  );

  app.use(passport.initialize());

  // links passport to the browser session
  app.use(passport.session());

  // assigns user info to session after successful authentication
  passport.serializeUser((user, done) => {
    const filteredUser = {
      microsoftId: user.id,
      firstName: user.name.givenName,
      lastName: user.name.familyName,
      email: user.emails[0].value,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };
    done(null, filteredUser);
  });

  // when a request is made, req.user becomes the user data stored in the session
  import { getUserByMicrosoftIdModel } from "../models/userModels.js";
  passport.deserializeUser(async (obj, done) => {
    try {
      const dbUserResult = await getUserByMicrosoftIdModel(obj.microsoftId);
      const dbUser = dbUserResult?.rows?.[0];
      if (!dbUser) {
        // User no longer exists in DB, destroy session
        return done(null, false);
      }
      // Optionally, you can merge session info with latest DB info here
      done(null, obj);
    } catch (err) {
      done(err);
    }
  });
}

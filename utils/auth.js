import dotenv from "dotenv";
import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";

dotenv.config({ path: ".env.auth" });

export function connectMicrosoft(app) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/callback",
        scope: ["User.Read"],
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, { ...profile, accessToken, refreshToken });
      },
    ),
  );

  app.use(passport.initialize());
  app.use(passport.session());

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

  passport.deserializeUser((obj, done) => {
    console.log(obj);
    done(null, obj);
  });
}

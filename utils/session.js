import session from "express-session";
import dotenv from "dotenv";

dotenv.config({ path: ".env.session-secret" });

// function to create a user session
export default function createSession(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      // cookie: function(req) {
      //   return {
      //     maxAge: 60000 * 60 * 24
      //   }
      // }
    }),
  );
}

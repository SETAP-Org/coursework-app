import session from "express-session";
import dotenv from "dotenv";

dotenv.config({ path: ".env.session-secret" });

export default function createSession(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );
}

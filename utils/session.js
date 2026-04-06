import session from "express-session";
import dotenv from "dotenv";

dotenv.config({ path: ".env.session-secret" });

export default function createSession(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // set to true in production with TLS + trust proxy
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );
}

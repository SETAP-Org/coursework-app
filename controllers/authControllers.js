import passport from "passport";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

// function to redirect user to landing if not signed in
export async function checkIfLoggedInRedirect(req, res, next) {
  // ensure user exists in session
  if (!req.user || !req.user.microsoftId) {
    return res.redirect("/");
  }

  try {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];

    if (
      req.user &&
      req.user.accessToken &&
      dbUser &&
      dbUser.username == req.params.username
    )
      next();
    else res.redirect("/");
  } catch (err) {
    console.error("checkIfLoggedInRedirect error:", err);
    res.redirect("/");
  }
}

// function to navigate to user dashboard if user already signed in
export async function checkIfLoggedIn(req, res, next) {
  if (req.user && req.user.accessToken) {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];
    return res.redirect(`/${dbUser.username}`);
  } else next();
}

// function to sign out user on request
export function signOut(req, res, next) {
  req.logout(next);
}

// hands control to microsoft for authentication (renavigates, etc.)
export function authenticatePassport(req, res, next) {
  return passport.authenticate("microsoft", { failureRedirect: "/" });
}

// middleware function to change justAuthenticated value in session
export function setJustAuthenticatedFlag(req, res, next) {
  req.session.justAuthenticated = !req.session.justAuthenticated;
  next();
}

// function to get the justAuthenticated value
export function getJustAuthenticatedFlag(req, res, next) {
  if (req.session.justAuthenticated) res.json(req.session.justAuthenticated);
  else res.json({ justAuthenticated: false });
}

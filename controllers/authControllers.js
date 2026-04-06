import passport from "passport";
import { getUserModel } from "../models/authModels.js";

// function to redirect user to landing if not signed in
export async function checkIfLoggedInRedirect(req, res, next) {
  // ensure user exists first
  if (!req.user || !req.user.microsoftId) {
    return res.redirect("/");
  }

  try {
    const dbUserResult = await getUserModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];

    if (
      req.user &&
      req.user.accessToken &&
      dbUser &&
      dbUser.username == req.params.username
    ) {
      return next();
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    console.error("checkIfLoggedInRedirect error:", err);
    return res.redirect("/");
  }
}

// function to navigate to user dashboard if user already signed in
export function checkIfLoggedIn(req, res, next) {
  if (req.user && req.user.accessToken)
    return res.redirect(`/${req.user.username}`);
  else next();
}

// function to sign out user on request
export function signOut(req, res, next) {
  req.logout(next);
}

// hands control to microsoft for authentication (renavigates, etc.)
export function authenticatePassport(req, res, next) {
  return passport.authenticate("microsoft", { failureRedirect: "/" });
}

// function to return user info (might not be needed as part of req.user)
export async function getCurrentUser(req, res, next) {
  if (req.user) {
    const dbUserResult = await getUserModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    const userObj = {
      sessionUser: req.user,
      dbUser: dbUser,
    };

    res.json(userObj);
  } else {
    res.status(401).json({ loggedIn: false });
  }
}

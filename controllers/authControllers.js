import passport from "passport";
import { getUserModel } from "../models/authModels.js";

// function to redirect user to landing if not signed in
export async function checkIfLoggedInRedirect(req, res, next) {
    const dbUserResult = await getUserModel(req.user.microsoftId);
    const dbUser = await dbUserResult.rows[0];

    if (req.user && req.user.accessToken && dbUser.username == req.params.username) next();
    else res.redirect("/");
}

// function to navigate to user dashboard if user already signed in
export function checkIfLoggedIn(req, res, next) {
    if (req.user && req.user.accessToken) return res.redirect(`/${req.user.username}`);
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

// function to return user info
export async function getCurrentUser(req, res, next) {
    if (req.user) {
        const dbUserResult = await getUserModel(req.user.microsoftId);
        const dbUser = await dbUserResult.rows[0];

        const userObj = {
            sessionUser: req.user,
            dbUser: dbUser
        }

        res.json(userObj);
    } else {
        res.status(401).json({loggedIn: false })
    }
}
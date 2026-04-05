import passport from "passport";
import { getUserModel } from "../models/authModels.js";

// function to redirect user to landing if not signed in
export function checkIfLoggedInRedirect(req, res, next) {
    if (req.user && req.user.accessToken && req.user.microsoftId == req.params.username) next();
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

// function to return user info (might not be needed as part of req.user)
export async function getCurrentUser(req, res, next){
    if (req.user) {
        const dbUserResult = await getUserModel(req.user.microsoftId);
        const dbUser = await dbUserResult.rows[0];
        console.log(dbUser, 'this is the db user');
        const userObj = {
            sessionUser: req.user,
            dbUser: dbUser
        }
        console.log(userObj, 'this is the final obj')
        res.json(userObj);
    } else {
        res.status(401).json({loggedIn: false })
    }
}
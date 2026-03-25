import passport from "passport";

export function checkIfLoggedIn(req, res, next) {
    if (req.user && req.user.accessToken) next();
    else res.redirect("/");
}

export function authenticatePassport(req, res, next) {
    return passport.authenticate("microsoft", { failureRedirect: "/" });
}
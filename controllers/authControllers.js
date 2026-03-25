import passport from "passport";

export function checkIfLoggedInRedirect(req, res, next) {
    if (req.user && req.user.accessToken) next();
    else res.redirect("/");
}

export function checkIfLoggedIn(req, res, next) {
    if (req.user && req.user.accessToken) res.redirect("/user-dashboard");
    else next()
}

export function authenticatePassport(req, res, next) {
    return passport.authenticate("microsoft", { failureRedirect: "/" });
}
import passport from "passport";

export function checkIfLoggedInRedirect(req, res, next) {
    if (req.user && req.user.accessToken) return next();
    else return res.redirect("/");
}

export function checkIfLoggedIn(req, res, next) {
    if (req.user && req.user.accessToken) return res.redirect("/user-dashboard");
    else return next()
}

export function authenticatePassport(req, res, next) {
    return passport.authenticate("microsoft", { failureRedirect: "/" });
}
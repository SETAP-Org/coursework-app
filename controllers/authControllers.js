import passport from "passport";

// function to redirect user to landing if not signed in
export function checkIfLoggedInRedirect(req, res, next) {
    if (req.user && req.user.accessToken) next();
    else res.redirect("/");
}

// function to navigate to user dashboard if user already signed in
export function checkIfLoggedIn(req, res, next) {
    if (req.user && req.user.accessToken) return res.redirect("/user-dashboard");
    else return next()
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
export function getCurrentUser(req, res){
    if (!req.user){
        return res.status(401).json({loggedIn: false });
    }

    return res.json({
        loggedIn: true,
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value||null
    })
}
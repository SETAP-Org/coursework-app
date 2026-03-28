import { checkIfLoggedInRedirect } from "../../controllers/authControllers";

app.get("/api/me".at, checkIfLoggedInRedirect, (req, res) => {
    if (!req.user){
        return res.status(401).json({loggedIn: false });
    }

    return res.json({
        loggedIn: true,
        name: req.user.displayName,
        email: req.user.emails?.[0]?.value||null
    })

})
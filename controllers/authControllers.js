import { isLoggedIn, authenticatePassport } from "../utils/auth.js"
import path from "path";
const __dirname = import.meta.dirname;

export function signInUserController(req, res) {
    isLoggedIn(req)
    ? res.sendFile(
        path.join(__dirname, "../public/pages/", "user_dashboard.html"),
    )
    : authenticatePassport();
}
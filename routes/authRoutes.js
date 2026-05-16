// AUTH ROUTES
// All routes relating to authentication

import { Router } from "express";

// Controller Imports
import {
  authenticatePassport,
  checkIfLoggedInRedirect,
  setJustAuthenticatedFlag,
  signOut,
  checkIfLoggedIn,
} from "../controllers/authControllers.js";
import { redirectWelcome } from "../controllers/serveControllers.js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/auth", checkIfLoggedIn, authenticatePassport());
router.get(
  "/auth/callback",
  authenticatePassport(),
  setJustAuthenticatedFlag,
  redirectWelcome,
);
router.get("/auth/signout", signOut, checkIfLoggedInRedirect);

// Export Router
export default router;

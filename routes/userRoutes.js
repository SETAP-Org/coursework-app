// USER ROUTES
// All routes relating to users

import { Router } from "express";

// Controller Imports
import {
  updateUsername,
  getCurrentUserPhoto,
  addUser,
  checkValidUsername,
} from "../controllers/userControllers.js";

// Middleware Imports
import {
  checkIfLoggedInCalendar,
  setJustAuthenticatedFlag,
} from "../controllers/authControllers.js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/me/photo", checkIfLoggedInCalendar, getCurrentUserPhoto);

// CREATE
router.post("/users/addUser", setJustAuthenticatedFlag, addUser);

// UPDATE
router.put("/users/changeUsername", checkValidUsername, updateUsername);

// Export Router
export default router;

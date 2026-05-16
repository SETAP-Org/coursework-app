// CONTRIBUTIONS ROUTES
// All routes relating to contributions

import { Router } from "express";

// Controller Imports
import { getProjectContributions } from "../controllers/contributionControllers.js";
import {
  isAuthenticated,
  checkMembership,
} from "../controllers/projectControllers.js";

// Router Declaration
const router = Router();

// Routes
// READ
router.get(
  "/contributions/:project_id",
  isAuthenticated,
  checkMembership,
  getProjectContributions,
);

// Export Router
export default router;

// CONTRIBUTIONS ROUTES
// All routes relating to contributions

import { Router } from "express";

// Controller Imports
import { getProjectContributions } from "../controllers/contributionControllers.js";

// Router Declaration
const router = Router();

// Routes
// READ
router.get("/contributions/:project_id", getProjectContributions);

// Export Router
export default router;

// PROJECT ROUTES
// All routes relating to projects

import { Router } from "express";

// Controller Imports
import {
  getProjectDetails,
  addProject,
  updateTeamLeader,
  removeProject,
  getUserProjects,
} from "../controllers/projectControllers.js";
import {
  addUserToProject,
  removeUserFromProject,
} from "../controllers/userProjectControllers.js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/me/projects", getUserProjects);
router.get("/projects/:project_id", getProjectDetails);

// CREATE
router.post("/projects/addProject", addProject);
router.post("/projects/user", addUserToProject);

// UPDATE
router.put("/projects/leader", updateTeamLeader);

// DELETE
router.delete("/projects/user", removeUserFromProject);

router.delete("/projects/:project_id", removeProject);

// Export Router
export default router;

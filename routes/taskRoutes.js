// TASK ROUTES
// All routes relating to tasks

import { Router } from "express";

// Controller Imports
import {
  getProjectTasks,
  addTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskControllers.js";

// Middleware Imports
import { checkMembership } from "../controllers/projectControllers.js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/projects/:project_id/tasks", getProjectTasks);

// CREATE
router.post("/tasks/:project_id/addTask", addTask);

// UPDATE
router.put(
  "/projects/:project_id/tasks/:task_id/updateStatus",
  checkMembership,
  updateTaskStatus,
);

// DELETE
router.delete(
  "/projects/:project_id/tasks/:task_id",
  checkMembership,
  deleteTask,
);

// Export Router
export default router;

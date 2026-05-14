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
import {
  checkMembership,
  isAuthenticated,
} from "../controllers/projectControllers.js";
import { isAuthImplicitGrantRedirectError } from "@supabase/supabase-js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/projects/:project_id/tasks", isAuthenticated, getProjectTasks);

// CREATE
router.post("/tasks/:project_id/addTask", isAuthenticated, addTask);

// UPDATE
router.put(
  "/projects/:project_id/tasks/:task_id/updateStatus",
  isAuthenticated,
  checkMembership,
  updateTaskStatus,
);

// DELETE
router.delete(
  "/projects/:project_id/tasks/:task_id",
  isAuthenticated,
  checkMembership,
  deleteTask,
);

// Export Router
export default router;

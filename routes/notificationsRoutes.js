// NOTIFICATION ROUTES
// All routes relating to notifications

import { Router } from "express";

// Controller Imports
import {
  fetchNotificationsByUserId,
  removeNotification,
} from "../controllers/notificationControllers.js";

// Router Declaration
const router = Router();

// Routes
// READ
router.get("/notifications/:user_id", fetchNotificationsByUserId);

// DELETE
router.delete("/notifications/:notification_id", removeNotification);

// Export Router
export default router;

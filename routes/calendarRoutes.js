// CALENDAR ROUTES
// All routes relating to calendars

import { Router } from "express";

// Controller Imports
import {
  getEvent,
  addEvent,
  removeEvent,
} from "../controllers/calendarControllers.js";

// Middleware Imports
import { checkIfLoggedInCalendar } from "../controllers/authControllers.js";

// Router Declaration
const router = Router();

// Routes
// API
router.get("/calendar/events", checkIfLoggedInCalendar, getEvent);
router.post("/calendar/events", checkIfLoggedInCalendar, addEvent);
router.delete(
  "/calendar/events/:eventId",
  checkIfLoggedInCalendar,
  removeEvent,
);

// Export Router
export default router;

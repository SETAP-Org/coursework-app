// NOTE ROUTES
// All routes relating to notes

import { Router } from "express";

// Controller Imports
import {
  addNote,
  updateNote,
  removeNote,
} from "../controllers/konvaControllers.js";

// Router Declaration
const router = Router();

// Routes
// CREATE
router.post("/notes", addNote);

// UPDATE
router.put("/notes/:note_id", updateNote);

// DELETE
router.delete("/notes/:note_id", removeNote);

// Export Router
export default router;

// NOTE ROUTES
// All routes relating to notes

import { Router } from "express";

import {
  addNote,
  updateNote,
  removeNote,
  getNotes,
} from "../controllers/konvaControllers.js";

const router = Router();

router.post("/notes", addNote);

router.get("/notes", getNotes);

router.put("/notes/:note_id", updateNote);

router.delete("/notes/:note_id", removeNote);

export default router;

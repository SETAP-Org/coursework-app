import { Router } from "express";
import {
  addFileMetadata,
  getFileMetadata,
  initFileUpload,
  getDownloadUrl,
} from "../controllers/fileControllers.js";

const router = Router();

router.post("/projects/:project_id/files/upload-init", initFileUpload);
router.post("/projects/:project_id/files/metadata", addFileMetadata);
router.get("/projects/:project_id/files/metadata", getFileMetadata);
router.get("/projects/:project_id/files/download", getDownloadUrl);

export default router;

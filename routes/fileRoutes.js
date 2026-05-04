import { Router } from "express";
import { 
  addFileMetadata,
  getFileMetadata,
  initFileUpload,
  getDownloadUrl,
} from "../controllers/fileControllers.js";

// Middleware Imports 

const router = Router();

router.post(
  "/api/projects/:project_id/files/upload-init",
  initFileUpload,
);

router.post(
  "/api/projects/:project_id/files/metadata",
  addFileMetadata,
);

router.get(
  "/api/projects/:project_id/files/metadata",
  getFileMetadata,
);

router.get(
  "/api/projects/:project_id/files/download",
  getDownloadUrl,
);

// Export Router
export default router;
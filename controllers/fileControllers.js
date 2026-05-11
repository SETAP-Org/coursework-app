import {
  postFileModel,
  getFilesByProjectIdModel,
  getFileByProjectIdAndFileIdModel,
  deleteFileByProjectIdAndFileIdModel,
} from "../models/fileModels.js";
import { isUserMemberOfProjectModel } from "../models/projectModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";
import { supabase, SHARED_FOLDERS_BUCKET } from "../utils/supabase.js";

const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024; // 10 MB

export async function addFileMetadata(req, res) {
  const { project_id } = req.params;
  const { fileName, storagePath, size } = req.body;

  const data = await postFileModel(project_id, fileName, storagePath, Number(size));
  return res.status(201).json(data.rows[0]);
}

export async function getFileMetadata(req, res) {
  const { project_id } = req.params;
  const data = await getFilesByProjectIdModel(project_id);

  return res.status(200).json(data.rows);
}

export async function initFileUpload(req, res) {
  const { project_id } = req.params;
  const { fileName, size } = req.body;
  const fileSize = Number(size);
  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    return res.status(413).json({ error: "File too large. Make sure it is up to 10 MB." });
  }
  const storagePath = `projects/${project_id}/${Date.now()}_${fileName}`;
  const { data } = await supabase.storage.from(SHARED_FOLDERS_BUCKET).createSignedUploadUrl(storagePath);
  return res.status(200).json({ ...data, storagePath });
}

export async function getDownloadUrl(req, res) {
  const { storagePath } = req.query;
  const { data } = await supabase.storage.from(SHARED_FOLDERS_BUCKET).createSignedUrl(storagePath, 60);
  return res.status(200).json(data);
}

export async function deleteFile(req, res) {
  try {
    const { project_id, file_id } = req.params;

    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    if (!dbUser) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const membershipResult = await isUserMemberOfProjectModel(dbUser.user_id, project_id);
    const isMember = membershipResult.rows[0]?.is_member;

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const fileResult = await getFileByProjectIdAndFileIdModel(project_id, file_id);
    const file = fileResult.rows[0];

    if (!file) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const { error: storageError } = await supabase.storage
      .from(SHARED_FOLDERS_BUCKET)
      .remove([file.storage_path]);

    if (storageError) {
      return res.status(500).json({
        success: false,
        error: "Failed to remove file from shared folder",
      });
    }

    const deleted = await deleteFileByProjectIdAndFileIdModel(project_id, file_id);

    if (!deleted.rows[0]) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    return res.status(200).json({ success: true, file: deleted.rows[0] });
  } catch (err) {
    console.error("deleteFile error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}


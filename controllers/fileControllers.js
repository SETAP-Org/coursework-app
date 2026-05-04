import { postFileModel, getFilesByProjectIdModel } from "../models/fileModels.js";
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

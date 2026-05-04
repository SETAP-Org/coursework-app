import { postFileModel, getFilesByProjectIdModel } from "../models/fileModels.js";
import { supabase, SHARED_FOLDERS_BUCKET } from "../utils/supabase.js";

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
  const { fileName } = req.body;
  const storagePath = `projects/${project_id}/${Date.now()}_${fileName}`;
  const { data } = await supabase.storage.from(SHARED_FOLDERS_BUCKET).createSignedUploadUrl(storagePath);
  return res.status(200).json({ ...data, storagePath });
}

export async function getDownloadUrl(req, res) {
  const { storagePath } = req.query;
  const { data } = await supabase.storage.from(SHARED_FOLDERS_BUCKET).createSignedUrl(storagePath, 60);
  return res.status(200).json(data);
}

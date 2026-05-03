import { postFileModel, getFilesByProjectIdModel } from "../models/fileModels.js";

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

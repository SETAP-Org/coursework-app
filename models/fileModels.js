import { query } from "../db/connection.js";

// Save uploaded file metadata in the database.
export async function postFileModel(projectId, fileName, storagePath, fileSize) {
  return await query(
    `
    INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
    `,
    [projectId, fileName, storagePath, fileSize],
  );
}

export async function getFilesByProjectIdModel(projectId) {
  return await query(
    `
    SELECT file_id, project_id, file_name, storage_path, size, date_uploaded
    FROM files
    WHERE project_id = $1
    ORDER BY date_uploaded DESC;
    `,
    [projectId],
  );
}

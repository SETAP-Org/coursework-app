import { query } from "../db/connection.js";

async function saveNoteToDB(projectId, text, x, y) {
    return await query(
        `INSERT INTO notes (project_id, widget_x, widget_y, widget_text) VALUES (\$1, \$2, \$3, \$4) RETURNING *;`,
        [projectId, x, y, text] 
    );
}

async function deleteNoteFromDB(projectId, text, x, y) {
    return await query(
        `DELETE FROM notes WHERE project_id = \$1 AND widget_x = \$2 AND widget_y = \$3 AND widget_text = \$4 RETURNING *;`,
        [projectId, x, y, text] 
    );
}

async function getNotesByProjectId(projectId) {
    // FIXED: Added space between await and query
    return await query(
        `SELECT widget_x, widget_y, widget_text FROM notes WHERE project_id = \$1;`,
        [projectId] 
    );
}

export { saveNoteToDB, deleteNoteFromDB, getNotesByProjectId };
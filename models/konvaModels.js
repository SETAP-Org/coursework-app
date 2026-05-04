import { query } from "../db/connection.js";

async function postNoteToDB(projectId, text, x, y, widgetId) {
    return await query(
        `INSERT INTO widgets (project_id, widget_x, widget_y, widget_text) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [projectId, Math.round(x), Math.round(y), text]
    );
}

async function putNoteById(widgetId, text, x, y) {
    return await query(
        `
        UPDATE widgets
        SET widget_text = $1, widget_x = $2, widget_y = $3
        WHERE widget_id = $4
        RETURNING *;
        `,
        [text, Math.round(x), Math.round(y), widgetId]
    );
}

async function deleteNoteFromDB(projectId, text, x, y) {
    return await query(
        `DELETE FROM widgets WHERE project_id = $1 AND widget_x = $2 AND widget_y = $3 AND widget_text = $4 RETURNING *;`,
        [projectId, x, y, text] 
    );
}

async function getNotesByProjectId(projectId) {
    return await query(
        `SELECT widget_id, widget_x, widget_y, widget_text FROM widgets WHERE project_id = $1;`,
        [projectId] 
    );
}

export { saveNoteToDB, deleteNoteFromDB, getNotesByProjectId };
import { query } from "../db/connection.js";

export async function postNoteToDB(projectId, text, x, y) {
    return await query(
        `INSERT INTO widgets (project_id, widget_x, widget_y, widget_text) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [projectId, Math.round(x), Math.round(y), text]
    );
}

export async function putNoteById(widgetId, text, x, y) {
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

export async function deleteNoteFromDB(noteId) {
    return await query(
        `
        DELETE FROM widgets
        WHERE widget_id = $1
        RETURNING *;
        `,
        [noteId] 
    );
}

export async function getNotesByProjectId(projectId) {
    return await query(
        `SELECT widget_id, widget_x, widget_y, widget_text FROM widgets WHERE project_id = $1;`,
        [projectId] 
    );
}
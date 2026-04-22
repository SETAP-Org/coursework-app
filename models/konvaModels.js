import { query } from "../db/connection.js";
console.log("konvaModels.js loaded");

async function saveNoteToDB(projectId, text, x, y, widgetId) {
    console.log("MODEL:", { projectId, text, x: typeof x, y: typeof y, widgetId });
    
    if (widgetId) {
        return await query(
            `UPDATE widgets SET widget_text = \$1, widget_x = \$2, widget_y = \$3 WHERE widget_id = \$4 AND project_id = \$5 RETURNING *;`,
            [text, Math.round(x), Math.round(y), widgetId, projectId]
        );
    }
    
    return await query(
        `INSERT INTO widgets (project_id, widget_x, widget_y, widget_text) VALUES (\$1, \$2, \$3, \$4) RETURNING *;`,
        [projectId, Math.round(x), Math.round(y), text]
    );
}

async function deleteNoteFromDB(projectId, text, x, y) {
    return await query(
        `DELETE FROM widgets WHERE project_id = \$1 AND widget_x = \$2 AND widget_y = \$3 AND widget_text = \$4 RETURNING *;`,
        [projectId, x, y, text] 
    );
}

async function getNotesByProjectId(projectId) {
    return await query(
        `SELECT widget_id, widget_x, widget_y, widget_text FROM widgets WHERE project_id = \$1;`,
        [projectId] 
    );
}

export { saveNoteToDB, deleteNoteFromDB, getNotesByProjectId };
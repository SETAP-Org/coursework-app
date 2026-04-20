import { saveNoteToDB, deleteNoteFromDB, getNotesByProjectId } from '../models/konvaModels.js';
console.log("KonvaController.js loaded");


export async function saveNote(req, res, next) {
    const { text, x, y, widgetId } = req.body;
    const projectId = req.session.project.project_id;
    console.log("saveNote called with widgetId:", widgetId);

    try {
        const result = await saveNoteToDB(projectId, text, x, y, widgetId);
        console.log("DB result:", result.rows[0]);
        res.status(200).json({ success: true, note: result.rows[0] });
    } catch (err) {
        console.error("Database error:", err);
        res.status(400).json({ success: false, message: "DB Error" });
    }
}

export async function deleteNote(req, res, next) {
    const { text, x, y } = req.body;
    try {
        const notes = await deleteNoteFromDB(req.session.project.project_id, text, x, y);
        res.status(200).json({ success: true, note: notes.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: "Failed to delete" });
    }
}

export async function getNotes(req, res) {
    try {
        const projectId = req.session.project.project_id;
        console.log("getNotes for project:", projectId);

        const result = await getNotesByProjectId(projectId);
        res.status(200).json({ notes: result.rows });
    } catch (err) {
        console.error("getNotes error:", err);
        res.status(500).json({ error: err.message });
    }
}
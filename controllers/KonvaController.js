import {saveNoteToDB, deleteNoteFromDB, getNotesByProjectId} from '../models/konvaModels.js';

export async function saveNote(req, res, next) {
    const { text, x, y } = req.body; 
    const projectId = req.session.project.project_id; 

    try {
        const notes = await saveNoteToDB(projectId, text, x, y);
        res.status(200).json({ success: true, note: notes.rows[0] });
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

export async function getNotes(req, res, next) {
    try {
        const projectId = req.session.project.project_id;
        const notes = await getNotesByProjectId(projectId);

        res.status(200).json({
            success: true,
            notes: notes.rows,
        })
    } catch (err) {
        console.error("Error with getNotes:", err);
        res.status(400).json({ success: false, message: "Failed to load notes" })
    }
}
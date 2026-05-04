import { postNoteToDB, putNoteById, deleteNoteFromDB, getNotesByProjectId } from '../models/konvaModels.js';

export async function addNote(req, res, next) {
    try {
        const { text, x, y, widgetId } = req.body;
        const projectId = req.params.project_id;

        const result = await saveNoteToDB(projectId, text, x, y, widgetId);

        res.status(200).json({
            success: true,
            note: result.rows[0],
        });
    } catch (err) {
        console.error("Error with saveNote:", err);

        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export async function updateNote(req, res, next) {
    try {
        const { text, x, y, widgetId } = req.body;

        const result = await putNoteById(widgetId, text, x, y);

        res.status(200).json({
            success: true,
            note: result.rows[0],
        });
    } catch (err) {
        console.error("Error with updateNote:", err);

        res.status(400).json({
            success: false,
            message: err.message,
        })
    }
}

export async function removeNote(req, res, next) {
    const { text, x, y } = req.body;
    try {
        const notes = await deleteNoteFromDB(req.session.project.project_id, text, x, y);
        res.status(200).json({
            success: true,
            note: notes.rows[0]
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Failed to delete"
        });
    }
}

export async function getNotes(req, res) {
    try {
        const projectId = req.session.project.project_id;
        console.log("getNotes for project:", projectId);

        const result = await getNotesByProjectId(projectId);
        res.status(200).json({
            success: true,
            notes: result.rows,
        });
    } catch (err) {
        console.error("getNotes error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}
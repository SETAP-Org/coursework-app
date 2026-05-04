import { postNoteToDB, putNoteById, deleteNoteFromDB, getNotesByProjectId } from '../models/konvaModels.js';

export async function addNote(req, res, next) {
    try {
        const { projectId, text, x, y } = req.body;
        const result = await postNoteToDB(projectId, text, x, y);
        
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
        const { text, x, y } = req.body;

        const result = await putNoteById(req.params.note_id, text, x, y);

        res.status(200).json({
            success: true,
            note: result.rows[0],
        });
    } catch (err) {
        console.error("Error with updateNote:", err);

        res.status(400).json({
            success: false,
            message: "THis is the place it breadks",
        })
    }
}

export async function removeNote(req, res, next) {
    try {
        const notes = await deleteNoteFromDB(req.params.note_id);

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
        console.log('we are getting here....')
        const projectId = req.session.project.project_id;
        console.log("getNotes for project:", projectId);

        const result = await getNotesByProjectId(projectId);
        console.log(result.rows, 'these are the rows...')
        console.log(typeof result.rows[0].widget_x)

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
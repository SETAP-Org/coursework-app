import {saveNoteToDB, deleteNoteFromDB, getNotesByProjectId} from '../models/konvaModels.js';

export async function saveNote(req, res, next) {
    try {
        const notes = await saveNoteToDB(req.session.project.project_id, req.body.noteText, req.body.x, req.body.y);
        
        res.status(200).json({
            success: true,
            message: "Note was saved successfully!",
            note: notes.rows[0],
        })
    }catch (err) {        
        console.error("Error with saveNote:", err);
        res.status(400).json({
            success: false,
            message: "Failed to save note"
        })
    }
}

export async function deleteNote(req, res, next) {
    try {
        const notes = await deleteNoteFromDB(req.session.project.project_id, req.body.noteText, req.body.x, req.body.y);

        res.status(200).json({
            success: true,
            message: "Note was deleted successfully!",
            note: notes.rows[0],
        })
    } catch (err) {
        console.error("Error with deleteNote:", err);
        res.status(400).json({
            success: false,
            message: "Failed to delete note"
        })
    }
}

export async function getNotes(req, res, next) {
    try {

        const projectId = req.session.project.project_id;
        console.log("Getting notes for project ID:", projectId);
        const notes = await getNotesByProjectId(projectId);

        res.status(200).json({
            success: true,
            notes: notes.rows,
        })
    } catch (err) {
        console.error("Error with getNotes:", err);
        res.status(400).json({
            success: false,
            message: "Failed to load notes"
        })
    }
}

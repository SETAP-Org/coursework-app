import { deleteUserFromProjectModel } from "../models/userProjectModels.js";

// function to remove a user from a project
export async function removeUserFromProject(req, res, next) {
    try {
        const { userId, projectId } = req.body;
        const data = await deleteUserFromProjectModel(userId, projectId);

        if (data.rows[0].length > 0) {
            res.status(200).json({
                success: true,
            })
        } else {
            res.status(404).json({
                success: false,
            })
        }
    } catch(err) {
        console.error("Error with removeUserFromProject:", err);

        res.status(400).json({
            success: false,
        })
    }
}

// function to add a user to a project
export async function addUserToProject(req, res, next) {
    try {
        const { userId, projectId } = req.body;
        const data = await postUserToProjectModel(userId, projectId);

        if (data.rows[0].length > 0) {
            res.status(200).json({
                success: true,
            })
        } else {
            res.status(400).json({
                success: false,
            })
        }
    } catch(err) {
        console.error("Error with removeUserFromProject:", err);
        
        res.status(400).json({
            success: false,
        })
    }
}
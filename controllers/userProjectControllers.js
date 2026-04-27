import { deleteUserFromProjectModel, postUserToProjectModel } from "../models/userProjectModels.js";
import { getUserByUsernameModel } from "../models/userModels.js";

// function to remove a user from a project
export async function removeUserFromProject(req, res, next) {
    try {
        const { userId, projectId } = req.body;
        const data = await deleteUserFromProjectModel(userId, projectId);

        if (data.rows.length > 0) {
            res.status(200).json({
                success: true,
                message: "You have been removed from this project!"
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Something went wrong!"
            })
        }
    } catch(err) {
        console.error("Error with removeUserFromProject:", err);

        res.status(400).json({
            success: false,
            message: err
        })
    }
}

// function to add a user to a project
export async function addUserToProject(req, res, next) {
    try {
        const { username, projectId } = req.body;

        // check if user actually existsf
        const userData = await getUserByUsernameModel(username);

        if (userData.rows.length === 0) {
            res.status(400).json({
                success: false,
                message: "User does not exist!"
            })
        }

        const data = await postUserToProjectModel(userData.rows[0].user_id, projectId);

        if (data.rows.length > 0) {
            res.status(200).json({
                success: true,
                message: "User successfully added to the project!",
                userId: userData.rows[0].user_id
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Something went wrong!"
            })
        }
    } catch(err) {
        console.error("Error with removeUserFromProject:", err);
        
        res.status(400).json({
            success: false,
            message: err
        })
    }
}
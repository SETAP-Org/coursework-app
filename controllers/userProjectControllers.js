import { deleteUserFromProjectModel, postUserToProjectModel } from "../models/userProjectModels.js";
import { getUserByUsernameModel } from "../models/userModels.js";

// function to remove a user from a project
export async function removeUserFromProject(req, res, next) {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "No request body"
            })
        }

        if (!req.body.userId) {
            return res.status(400).json({
                success: false,
                message: "No user ID provided"
            })
        }

        if (!req.body.projectId) {
            return res.status(400).json({
                success: false,
                message: "No project ID provided"
            })
        }

        const { userId, projectId } = req.body;
        const data = await deleteUserFromProjectModel(userId, projectId);

        res.status(200).json({
            success: true,
            message: "You have been removed from this project!"
        })
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "Database error"
        })
    }
}

// function to add a user to a project
export async function addUserToProject(req, res, next) {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "No request body"
            })
        }

        if (!req.body.username) {
            return res.status(400).json({
                success: false,
                message: "No username provided"
            })
        }

        if (!req.body.projectId) {
            return res.status(400).json({
                success: false,
                message: "No project ID provided"
            })
        }

        const { username, projectId } = req.body;

        // check if user actually exists
        const userData = await getUserByUsernameModel(username);

        if (userData.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User does not exist!"
            })
        }

        // add the user to the project
        const data = await postUserToProjectModel(userData.rows[0].user_id, projectId);

        res.status(200).json({
            success: true,
            message: "User successfully added to the project!",
            userId: userData.rows[0].user_id
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
}
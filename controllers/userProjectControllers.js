import { deleteUserFromProjectModel } from "../models/userProjectModels.js";

export async function removeUserFromProject(req, res, next) {
    try {
        console.log('we are getting here!');
    } catch(err) {
        console.error("Error with removeUserFromProject:", err);
        res.status(400).json({
            success: false,
        })
    }
}
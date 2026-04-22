import { deleteUserFromProjectModel } from "../models/userProjectModels.js";

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
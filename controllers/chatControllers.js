import { postMessageModel, getMessagesByProjectIdModel } from "../models/chatModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

export async function addMessage(req, res, next) {
    try {
        const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
        const dbUser = dbUserResult?.rows?.[0];
        const userId = dbUser.user_id;

        const data = await postMessageModel(
            userId,
            req.session.project.project_id,
            req.body.messageContent,
        );

        res.status(200).json({
            success:true,
            message: "message was added successfully!",
        })
    } catch(err) {
        console.error("Error with addMessage:", err);
        res.status(400).json({
            success: false,
            message: err
        })
    }
}

export async function getMessages(req, res, next) {
    try {
        const data = await getMessagesByProjectIdModel(req.session.project.project_id);
        
        res.status(200).json({
            success: true,
            messages: data.rows,
        })
    } catch (err) {
        console.error("Error with getMessages:", err);
        res.status(400).json({
            success: false,
            message: "Failed to load messages"
        })
    }
}
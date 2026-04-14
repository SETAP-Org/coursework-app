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

        console.log(data, "here is the data!!!!");

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
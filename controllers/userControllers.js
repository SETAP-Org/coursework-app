import { postUserModel } from "../models/userModels.js";

// function to add a user to the database
export async function addUserController(req, res, next) {
    try {
        const { microsoftId, firstName, lastName, email } = req.user;
        await postUserModel(microsoftId, firstName, lastName, email, microsoftId);
        next();
    } catch (err) {
        console.log(err, 'this is the error!');
    }
}
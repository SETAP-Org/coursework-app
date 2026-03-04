import { getAllUsersModel, postUserModel } from "../models/userModels.js";

export async function getAllUsersController(req, res) {
    try {
        res.json(await getAllUsersModel());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function postUserController(req, res) {
    try {
        const result = await postUserModel();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
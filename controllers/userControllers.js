import { getAllUsersModel } from "../models/userModels.js";

export async function getAllUsersController(req, res) {
    res.json(await getAllUsersModel());
}
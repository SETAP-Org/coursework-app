import { query } from "../db/connection.js";

export async function getAllUsersModel() {
    return await query("SELECT * FROM users;");
}
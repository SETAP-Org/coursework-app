import { query } from "../db/connection.js";

export async function getUserModel(id) {
    return await query(
        `
        SELECT * FROM users
        WHERE microsoft_id = $1;
        `,
        [id]
    )
}
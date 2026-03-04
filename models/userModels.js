import { query } from "../db/connection.js";

export async function getAllUsersModel() {
    return await query("SELECT * FROM users;");
}

export async function postUserModel() {
    return await query(`
        INSERT INTO users (user_first_name, user_last_name, user_email)
        VALUES ('Person', '1', 'person1@email.com')
        RETURNING *;
    `)
}
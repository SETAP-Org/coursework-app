import { query } from "../db/connection.js";

// model to add user to database if user not already registered, and return the user
export async function postUserModel(microsoftId, firstName, lastName, email, username) {
    return await query(
        `
        INSERT INTO users (microsoft_id, user_first_name, user_last_name, user_email, date_created, last_login, username)
        VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
        ON CONFLICT (microsoft_id)
        DO UPDATE SET last_login = NOW()
        RETURNING *;
        `,
        [microsoftId, firstName, lastName, email, username]
    );
}
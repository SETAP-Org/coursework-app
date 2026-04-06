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

// model to check valid username
export async function getUserByUsernameModel(username) {
    return await query(
        `
        SELECT * FROM users
        WHERE username = $1;
        `,
        [username]
    )
}

// model to update username
export async function putUsernameById(microsoftId, username) {
    return await query(
        `
        UPDATE users
        SET username = $2
        WHERE microsoft_id = $1
        RETURNING *;
        `,
        [microsoftId]
    )
}
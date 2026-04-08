import { query } from "../db/connection.js";

// ---- CREATE ----
// creates a new user if possible
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

// ---- READ ----
// read a user via their microsoft ID
export async function getUserByMicrosoftIdModel(microsoftId) {
    return await query(
        `
        SELECT * FROM users
        WHERE microsoft_id = $1;
        `,
        [microsoftId]
    )
}

// read a user via their username
// (mainly used for change username functionality)
// (users needed for other tasks should be retrieved via their microsoft ID)
export async function getUserByUsernameModel(username) {
    return await query(
        `
        SELECT * FROM users
        WHERE username = $1;
        `,
        [username]
    )
}

// ---- UPDATE ----
// update a users username
export async function putUsernameByIdModel(microsoftId, username) {
    return await query(
        `
        UPDATE users
        SET username = $2
        WHERE microsoft_id = $1
        RETURNING *;
        `,
        [microsoftId, username]
    )
}

// ---- DELETE ----
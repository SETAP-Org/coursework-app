import { query } from "../db/connection.js";

export async function getAllUsersModel() {
    return await query("SELECT * FROM users;");
}

// export async function postUserModel() {
//     return await query(`
//         INSERT INTO users (user_first_name, user_last_name, user_email)
//         VALUES ('Person', '1', 'person1@email.com')
//         RETURNING *;
//     `)
// }

export async function postUserModel(microsoftId, firstName, lastName, email) {
    return await query(
        `
        INSERT INTO users (microsoft_id, user_first_name, user_last_name, user_email, date_created, last_login)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (microsoft_id)
        DO UPDATE SET last_login = NOW()
        RETURNING *;
        `,
        [microsoftId, firstName, lastName, email]
    );
}
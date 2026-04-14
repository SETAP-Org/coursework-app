import { query } from "../db/connection.js";

// CREATE
export async function postMessageModel(senderId, projectId, message) {
    return await query(
        `
        INSERT INTO messages(sender_id, project_id, message_content, m_date_sent)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
        `,
        [senderId, projectId, message],
    );
}

// READ
export async function getMessagesByProjectIdModel(projectId) {
    return await query(
        `
        SELECT sender_id, message_content, m_date_sent
        FROM messages
        WHERE project_id = $1
        `,
        [projectId],
    );
}

// UPDATE

// DELETE
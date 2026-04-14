import { query } from "../db/connection.js";

// CREATE
// postMessageModel
// export async function postMessageModel() {
//     return await query(
//         `
//         INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
//         VALUES ($1, $1, $2, $3, NOW(), NOW())
//         ON CONFLICT (created_by, project_name)
//         DO NOTHING
//         RETURNING *;
//         `,
//         [],
//     );
// }

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
// getMessagesByProjectIdModel

// UPDATE

// DELETE
import { query } from "../db/connection";

// export async function postMessageModel(senderId, projectId, message) {
//     return await query(
//         `
//         INSERT INTO messages(sender_id, project_id, message_content, m_date_sent)
//         VALUES ($1, $2, $3, NOW())
//         RETURNING *;
//         `,
//         [senderId, projectId, message],
//     );
// }

// CREATE
export async function postNotificationModel(user_id, project_id, task_id, notification_type, notification_message) {
    return await query(
        `
        INSERT INTO notifications (user_id, project_id, task_id, notification_type, notification_message, n_date_created)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *;
        `,
        [user_id, project_id, task_id, notification_type, notification_message],
    );
}

// READ
export async function getNotificationsModel(user_id) {
    return await query(
        `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY n_date_created DESC;
        `,
        [user_id],
    );
}

// UPDATE

// DELETE
export async function deleteNotificationModel() {
    return await query(
        `
        `,
        [],
    );
}
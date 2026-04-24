import { query } from "../db/connection.js";

// CREATE
export async function postNotificationModel(user_id, project_id, notification_type, notification_message) {
    return await query(
        `
        INSERT INTO notifications (user_id, project_id, notification_type, notification_message, n_date_created)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
        `,
        [user_id, project_id, notification_type, notification_message],
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
export async function deleteNotificationModel(notification_id) {
    return await query(
        `
        DELETE FROM notifications
        WHERE notification_id = $1
        RETURNING *;
        `,
        [notification_id],
    );
}
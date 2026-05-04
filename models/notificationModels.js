import { query } from "../db/connection.js";
import { sendNotificationEmail } from "../utils/emailSender.js";
import { getUserByIdModel } from "./userModels.js";

// CREATE
export async function postNotificationModel(user_id, project_id, notification_type, notification_message, target_username, project_name) {
    try {
        const result = await query(
            `
            INSERT INTO notifications (user_id, project_id, notification_type, notification_message, n_date_created, target_username, project_name)
            VALUES ($1, $2, $3, $4, NOW(), $5, $6)
            RETURNING *;
            `,
            [user_id, project_id, notification_type, notification_message, target_username, project_name],
        );

        // Send email notification if user has email notifications enabled
        if (result.rows && result.rows.length > 0) {
            try {
                const userResult = await getUserByIdModel(user_id);
                if (userResult.rows && userResult.rows.length > 0) {
                    const user = userResult.rows[0];
                    if (user.email_notifications && user.user_email) {
                        // Send email asynchronously without blocking the response
                        console.log(`� Sending email notification to ${user.user_first_name} (${user.user_email}) for: ${notification_type}`);
                        sendNotificationEmail(
                            user.user_email,
                            user.user_first_name,
                            notification_message,
                            notification_type,
                            project_name
                        ).catch(err => console.error('❌ Failed to send notification email:', err));
                    } else {
                        console.log(`📭 Email notifications disabled for ${user.user_first_name} (${user.user_email || 'no email'})`);
                    }
                }
            } catch (emailError) {
                console.error('Error processing email notification:', emailError);
                // Don't throw - in-app notification is already created
            }
        }

        return result;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
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
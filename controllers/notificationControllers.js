import { postNotificationModel, getNotificationsModel, deleteNotificationModel } from "../models/notificationModels.js";

// function to fetch all user notifications
export async function fetchNotificationsByUserId(req, res, next) {
    try {
        const response = await getNotificationsModel(req.params.user_id);
        const data = await response.rows;

        res.status(200).json({
            success: true,
            notifications: data,
        })
    } catch(err) {
        console.error("Error with fetchNotificationsByUserId:", err);

        res.status(400).json({
            success: false,
            message: err,
        })
    }
};

// function to delete a notification
export async function removeNotification(req, res, next) {
    try {
        const data = await deleteNotificationModel(req.params.notification_id);

        if (data.rows.length === 0) {
            res.status(400).json({
                success: false,
                message: "Something went wrong.",
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully!",
            })
        }
    } catch(err) {
        console.error("Error with fetchNotificationsByUserId:", err);

        res.status(400).json({
            success: false,
            message: err,
        })
    }
};
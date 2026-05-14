import {
    postUserModel,
    getUserByUsernameModel,
    getUserByMicrosoftIdModel,
    putUsernameByIdModel,
    putEmailNotificationPreferenceModel
} from "../models/userModels.js";
import { getProfilePhoto } from "../models/calendarModels.js";

// function to add a user to the database
export async function addUser(req, res, next) {
    try {
        if (!req.user) {
            res.status(400).json({
                success: false,
                message: "No session user"
            })
        } else {
            const { microsoftId, firstName, lastName, email } = req.user;
            const data = await postUserModel(microsoftId, firstName, lastName, email, microsoftId);
            res.status(200).json({
                success: true,
                message: "User added successfully!",
                user: data.rows[0],
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Database error"
        })
    }
}

// function to get a user by username
export async function checkValidUsername(req, res, next) {
    try {
        const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
        const dbUser = await dbUserResult.rows[0];

        // check if anyone else has that username
        const fetchedUser = await getUserByUsernameModel(req.body.usernameValue);
        
        if (fetchedUser.rows.length != 0) {
            return res.status(409).json({
                success: false,
                message: "Username already taken!"
            })
        }

        // if not, then move to the next middleware
        next()
    } catch(err) {
        console.error("checkValidUsername error:", err);
        return res.status(400).json({
            success: false,
            message: "There was an error. Check console logs for more information."
        })
    }
}

// controller to update usernames
export async function updateUsername(req, res, next) {
    try {
        const userId = req.user.microsoftId;
        const data = await putUsernameByIdModel(userId, req.body.usernameValue);

        if (data.rows[0].username == req.body.usernameValue) {
            return res.status(200).json({
                success: true,
                message: "Your username has been changed :)"
            })
        }
    } catch(err) {
        console.error("updateUsername error:", err)
        res.status(400).json({
            success: false,
            message: "Error updating username, see console logs for more information."
        })
    }
}

export async function getCurrentUserPhoto(req, res) {
    if (!req.user?.accessToken) {
        return res.redirect("/assets/default-avatar.svg");
    }

    try {
        const photo = await getProfilePhoto(req.user.accessToken);

        res.set("Content-Type", photo.contentType);
        res.set("Cache-Control", "no-store");
        return res.send(photo.buffer);
    } catch (err) {
        console.error("getCurrentUserPhoto error:", err.message);
        return res.redirect("/assets/default-avatar.svg");
    }
}

// controller to update email notification preference
export async function updateEmailNotificationPreference(req, res) {
    try {
        const userId = req.user.microsoftId;
        const emailNotifications = req.body.emailNotifications;

        if (typeof emailNotifications !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Invalid email notification preference value"
            });
        }

        const data = await putEmailNotificationPreferenceModel(userId, emailNotifications);

        if (data.rows[0]) {
            return res.status(200).json({
                success: true,
                message: "Email notification preference changed :)",
                emailNotifications: data.rows[0].email_notifications
            });
        }
    } catch(err) {
        console.error("updateEmailNotificationPreference error:", err);
        res.status(400).json({
            success: false,
            message: "Error updating email notification preference, see console logs for more information."
        })
    }
}
import {
    postUserModel,
    getUserByUsernameModel,
    getUserByMicrosoftIdModel,
    putUsernameByIdModel
} from "../models/userModels.js";

// function to add a user to the database
export async function addUser(req, res, next) {
    try {
        const { microsoftId, firstName, lastName, email } = req.user;
        await postUserModel(microsoftId, firstName, lastName, email, microsoftId);
        res.status(200).json({
            success: true,
            message: "User added successfully!"
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err
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

// function to return user info (might not be needed as part of req.user)
export async function getCurrentUser(req, res, next) {
    if (req.user) {
        const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
        const dbUser = dbUserResult.rows[0];

        if (!dbUser) {
            return res.status(200).json({
                sessionUser: req.user,
                dbUser: null
            });
        }

        res.status(200).json({
            sessionUser: req.user,
            dbUser: dbUser,
        });
    } else {
        res.status(404).json({
            sessionUser: null,
            dbUser: null
        });
    }
}
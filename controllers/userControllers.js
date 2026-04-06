import { postUserModel, getUserByUsernameModel, putUsernameByIdModel } from "../models/userModels.js";
import { getUserModel } from "../models/authModels.js";

// function to add a user to the database
export async function addUserController(req, res, next) {
    try {
        const { microsoftId, firstName, lastName, email } = req.user;
        await postUserModel(microsoftId, firstName, lastName, email, microsoftId);
        next();
    } catch (err) {
        console.log(err, 'this is the error!');
    }
}

// function to get a user by username
export async function checkValidUsernameController(req, res, next) {
    try {
        const dbUserResult = await getUserModel(req.user.microsoftId);
        const dbUser = await dbUserResult.rows[0];

        // check if user already has that username
        if (dbUser.username == req.body.usernameValue) {
            return res.status(400).json({
                success: false,
                message: "You already have that username!"
            })
        }

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
        console.log(err, "this is the error!");
    }
}

// controller to update usernames
export async function updateUsernameController(req, res, next) {
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
        console.log(err, 'this is the error!');
    }
}
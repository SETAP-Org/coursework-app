import {
  postTaskModel,
  getTasksByProjectIdModel,
} from "../models/taskModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

export async function addTask(req, res, next) {
  try {
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult?.rows?.[0];
    const userId = dbUser.user_id;

    const data = await postTaskModel(
      req.session.project.project_id,
      req.body.taskAssignee,
      req.body.taskTitle,
      req.body.taskDesc,
      req.body.taskWeight,
      req.body.taskDeadline,
    );

    if (data.rows[0]) {
      res.status(200).json({
        success: true,
        task: "Task added successfully!",
      });
    }
  } catch (err) {
    console.error("Error with addTask:", err);
    res.status(400).json({
      success: false,
      task: err,
    });
  }
}

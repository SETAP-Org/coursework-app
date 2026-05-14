import {
  postTaskModel,
  getTasksByProjectIdModel,
  getTaskByIdModel,
  updateTaskStatusModel,
  deleteTaskModel,
} from "../models/taskModels.js";
import { getUserByMicrosoftIdModel } from "../models/userModels.js";

export async function addTask(req, res, next) {
  try {
    const { project_id } = req.params;
    const data = await postTaskModel(
      project_id,
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

export async function getProjectTasks(req, res, next) {
  try {
    const { project_id } = req.params;
    const projectTasksResult = await getTasksByProjectIdModel(project_id);
    const projectTasks = projectTasksResult.rows;

    res.json({ success: true, tasks: projectTasks });
  } catch (err) {
    console.error("getProjectTasks error:", err);
    res.status(401).json({ loggedIn: false });
  }
}

export async function updateTaskStatus(req, res, next) {
  try {
    const { project_id, task_id } = req.params;
    const { taskStatus } = req.body;

    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    const taskResult = await getTaskByIdModel(task_id);
    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (task.assignee_id !== dbUser.user_id) {
      return res.status(403).json({
        success: false,
        error: "Task not assigned to current user",
      });
    }

    const valid_statuses = ["To Do", "In Progress", "Completed"];

    if (!valid_statuses.includes(taskStatus)) {
      return res.status(400).json({
        success: false,
        error: `taskStatus must be one of ${valid_statuses}`,
      });
    }

    const updated_task = await updateTaskStatusModel(
      task_id,
      project_id,
      taskStatus,
    );

    if (updated_task.rows && updated_task.rows[0]) {
      return res
        .status(200)
        .json({ success: true, task: updated_task.rows[0] });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Task not found or not in project" });
    }
  } catch (err) {
    console.error("updateTaskStatus error: ", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { project_id, task_id } = req.params;

    const projectResult = await getProjectByIdModel(project_id);
    const project = projectResult.rows[0];

    if (!project) {
      return res
        .status(400)
        .json({ success: false, error: "Project not loaded" });
    }

    // current user
    const dbUserResult = await getUserByMicrosoftIdModel(req.user.microsoftId);
    const dbUser = dbUserResult.rows[0];

    // Only team leader allowed to delete any task
    if (String(dbUser.user_id) !== String(project.team_leader_id)) {
      return res.status(403).json({
        success: false,
        error: "Only the team leader may delete tasks",
      });
    }

    const deleted = await deleteTaskModel(task_id, project_id);

    if (deleted.rows && deleted.rows[0]) {
      return res.status(200).json({ success: true, task: deleted.rows[0] });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Task not found or not in project" });
    }
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

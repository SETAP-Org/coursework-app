import { query } from "../db/connection.js";

// CREATE
export async function postTaskModel(
  projectId,
  assigneeId,
  task_title,
  task_description,
  task_weight,
  task_deadline,
) {
  return await query(
    `
        INSERT INTO tasks(project_id, assignee_id, task_title, task_description, task_weight, task_status, task_deadline, t_date_created, t_time_updated)
        VALUES ($1, $2, $3, $4, $5, 'To Do', $6, NOW(), NOW())
        RETURNING *;
        `,
    [
      projectId,
      assigneeId,
      task_title,
      task_description,
      task_weight,
      task_deadline,
    ],
  );
}

// ALTER
export async function updateTaskStatusModel(taskId, projectId, status) {
  return await query(
    `
    UPDATE tasks
    SET task_status = $3, t_time_updated = NOW()
    WHERE task_id = $1 AND project_id = $2
    RETURNING *;
    `,
    [taskId, projectId, status],
  );
}

// READ
export async function getTasksByProjectIdModel(projectId) {
  return await query(
    `
        SELECT task_id, assignee_id, task_title, task_description, task_weight, task_status, task_deadline
        FROM tasks
        WHERE project_id = $1
        ORDER BY task_deadline ASC
        `,
    [projectId],
  );
}

export async function getTaskByIdModel(taskId) {
  return await query(
    `
      SELECT task_id, project_id, assignee_id, task_title, task_description, task_weight, task_status, task_deadline
      FROM tasks
      WHERE task_id = $1
      LIMIT 1
    `,
    [taskId],
  );
}

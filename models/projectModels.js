import { query } from "../db/connection.js";

// ---- CREATE ----
// create project if project name not already taken by user
export async function postProjectModel(
  userId,
  projectName,
  projectDeadline
) {
  return await query(
    `
    INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    VALUES ($1, $1, $2, $3, NOW(), NOW())
    ON CONFLICT (created_by, project_name)
    DO NOTHING
    RETURNING *;
    `,
    [userId, projectName, projectDeadline],
  );
};

// create entry in intersection table between users and projects
export async function postUserProjectModel(userId, projectId) {
  return await query(
    `
    INSERT INTO user_projects (user_id, project_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, project_id)
    DO NOTHING
    RETURNING *;
    `,
    [userId, projectId],
  );
}

// ---- READ ----
// read a project via its project ID
export async function getProjectByIdModel(project_id) {
  return await query(
    `
    SELECT project_id, team_leader_id, project_name, project_deadline
    FROM projects
    WHERE project_id = $1;
    `,
    [project_id],
  );
}

// read a project via who created it
export async function getProjectByCreatorAndNameModel(
  project_creator_id,
  project_name,
) {
  return await query(
    `
    SELECT project_id, team_leader_id, project_name, project_deadline
    FROM projects
    WHERE created_by = $1 AND project_name = $2;
    `,
    [project_creator_id, project_name],
  );
}

// read entries from intersection table between users and projects via user ID
export async function getUserProjectsModel(userId) {
  return await query(
    `
    SELECT *
    FROM projects p
    JOIN user_projects up
    ON p.project_id = up.project_id
    WHERE up.user_id = $1;
    `,
    [userId],
  );
}

// ---- UPDATE ----

// ---- DELETE ----
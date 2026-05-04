import { query } from "../db/connection.js";

// ---- CREATE ----
// create project if project name not already taken by user
export async function postProjectModel(userId, projectName, projectDeadline) {
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
}

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

// read entries from intersection table between users and projects via user ID
export async function getUserProjectsModel(userId) {
  return await query(
    `
    SELECT p.*, up.*, u.username AS creator_username
    FROM projects p
    JOIN user_projects up
      ON p.project_id = up.project_id
    JOIN users u
      ON p.created_by = u.user_id
    WHERE up.user_id = $1
    ORDER BY p.project_deadline ASC NULLS LAST;
    `,
    [userId],
  );
}

// reads whether or not a memebr is a part of a project
export async function isUserMemberOfProjectModel(userId, projectId) {
  return await query(
    `
    SELECT
      (EXISTS (
        SELECT 1 FROM user_projects up
        WHERE up.user_id = $1 AND up.project_id = $2)
      OR EXISTS (
        SELECT 1 FROM projects p
        WHERE p.project_id = $2 AND (p.created_by = $1 OR p.team_leader_id = $1)
      )) AS is_member;
    `,
    [userId, projectId],
  );
}

// ---- UPDATE ----
// update the team leader of a project
export async function putTeamLeader(newLeaderId, projectId) {
  return await query(
    `
    UPDATE projects
    SET team_leader_id = $1
    WHERE project_id = $2
    RETURNING *;
    `,
    [newLeaderId, projectId],
  );
}

// ---- DELETE ----
// delete a project by its ID (cascades if foreign keys are set to ON DELETE CASCADE)
export async function deleteProjectByIdModel(projectId) {
  return await query(
    `
    DELETE FROM projects
    WHERE project_id = $1
    RETURNING *;
    `,
    [projectId],
  );
}

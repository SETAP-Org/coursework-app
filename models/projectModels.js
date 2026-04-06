import { query } from "../db/connection.js";
import { getUserModel } from "./authModels.js";

// Add new project to db - if project by same user with same project_name exists, do nothing
export async function postProjectModel(
  microsoftId,
  project_name,
  project_deadline,
) {
  // created_by & team_leader_id must be UUID, so get proper user_id from db
  const userResult = await getUserModel(microsoftId);
  const user = userResult.rows[0];

  if (!user) {
    // Null if no user found
    return null;
  }

  const team_leader_id = user.user_id;

  return await query(
    `
        INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
        VALUES ($1, $1, $2, $3, NOW(), NOW())
        ON CONFLICT (created_by, project_name)
        DO NOTHING
        RETURNING *;
        `,
    [team_leader_id, project_name, project_deadline],
  );
}

export async function getProjectByIdModel(project_id) {
  return await query(
    `
    SELECT project_id, team_leader_id, project_name, project_deadline FROM projects WHERE project_id = $1;
    `,
    [project_id],
  );
}

export async function getProjectByLeaderAndNameModel(
  team_leader_id,
  project_name,
) {
  return await query(
    `
    SELECT project_id, team_leader_id, project_name, project_deadline FROM projects WHERE team_leader_id = $1 AND project_name = $2;
    `,
    [team_leader_id, project_name],
  );
}

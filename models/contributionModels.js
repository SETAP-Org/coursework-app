import { query } from "../db/connection.js";

// READ
export async function getContributionsByProjectIdModel(
  projectId,
  status = "Completed",
) {
  return await query(
    `
    WITH project_members AS (
      SELECT u.user_id, u.username
      FROM user_projects up
      JOIN users u ON up.user_id = u.user_id
      WHERE up.project_id = $1
    ),
    completed AS (
      SELECT
        assignee_id,
        SUM(COALESCE(task_weight, 0))::numeric AS user_weight
      FROM tasks
      WHERE project_id = $1
        AND task_status = $2::task_status
      GROUP BY assignee_id
    ),
    project_total AS (
      SELECT COALESCE(SUM(user_weight), 0)::numeric AS project_weight
      FROM completed
    )
    SELECT
      pt.project_weight::float8 AS project_weight,
      json_agg(
        json_build_object(
          'assignee_id', pm.user_id,
          'username', pm.username,
          'user_weight', COALESCE(c.user_weight, 0)::float8,
          'pct_of_project',
            CASE
              WHEN pt.project_weight = 0 THEN 0
              ELSE ROUND(COALESCE(c.user_weight, 0) / pt.project_weight * 100, 2)::float8
            END
        )
        ORDER BY
          CASE
            WHEN pt.project_weight = 0 THEN 0
            ELSE ROUND(COALESCE(c.user_weight, 0) / pt.project_weight * 100, 2)
          END DESC,
          pm.username
      ) AS contributions
    FROM project_members pm
    LEFT JOIN completed c ON c.assignee_id = pm.user_id
    CROSS JOIN project_total pt
    GROUP BY pt.project_weight;
    `,
    [projectId, status],
  );
}

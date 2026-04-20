import { query } from "../db/connection.js";

// function to read user ids and usernames of all users in project
export async function getUsersByProjectId(projectId) {
    return await query(
        `
        SELECT u.user_id, u.username
        FROM user_projects up
        JOIN users u ON up.user_id = u.user_id
        WHERE up.project_id = $1
        ORDER BY u.username ASC;
        `,
        [projectId]
    );
}
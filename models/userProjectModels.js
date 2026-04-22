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

// function to remove user from project
export async function deleteUserFromProjectModel(user_id, project_id) {
    return await query(
        `
        DELETE FROM user_projects
        WHERE user_id = $1 AND project_id = $2;
        `,
        [user_id, project_id]
    );
}

// function to add a new user to a project
export async function postUserToProjectModel(user_id, project_id) {
    return await query(
        `
        INSERT INTO user_projects (user_id, project_id)
        VALUES ($1, $2)
        RETURNING *;
        `,
        [user_id, project_id]
    );
}

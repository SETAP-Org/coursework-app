import { query } from "../db/connection.js";

// CREATE
export async function postMeetingModel(projectId, location, description, subject, start, end) {
    return await query(
        `
        INSERT INTO meetings(project_id, meeting_location, meeting_description, meeting_subject, meeting_start, meeting_end)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [projectId, location, description, subject, start, end],
    );
}

// READ
export async function getMeetingsByProjectIdModel(projectId) {
    return await query(
        `
        SELECT project_id, meeting_location, meeting_description, meeting_subject, meeting_start, meeting_end
        FROM meetings
        WHERE project_id = $1;
        `,
        [projectId],
    );
}
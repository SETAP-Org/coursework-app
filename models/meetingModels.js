import { query } from "../db/connection.js";

// CREATE
export async function postMeetingModel(projectId, time, duration, location, description, subject) {
    return await query(
        `
        INSERT INTO meetings(project_id, scheduled_time, meeting_duration, meeting_location, meeting_description, meeting_subject)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [projectId, time, duration, location, description, subject],
    );
}

// READ
export async function getMeetingsByProjectIdModel(projectId) {
    return await query(
        `
        SELECT project_id, scheduled_time, meeting_duration, meeting_location, meeting_description, meeting_subject
        FROM meetings
        WHERE project_id = $1;
        `,
        [projectId],
    );
}
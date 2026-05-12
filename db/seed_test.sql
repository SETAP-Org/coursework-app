-- UR3 Seed Data --
WITH alice AS (
    INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Alice', 'Leader', 'alice@example.com', 'ms-alice', NOW(), NOW(), 'alice', FALSE)
    RETURNING user_id
), bob AS (
    INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Bob', 'Member', 'bob@example.com', 'ms-bob', NOW(), NOW(), 'bob', FALSE)
    RETURNING user_id
), project AS (
    INSERT INTO PROJECTS (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    SELECT alice.user_id, alice.user_id, 'Test Project', '2099-12-31', NOW(), NOW()
    FROM alice
    RETURNING project_id, team_leader_id
)

INSERT INTO USER_PROJECTS (user_id, project_id)
SELECT alice.user_id, project.project_id FROM alice, project
UNION ALL
SELECT bob.user_id, project.project_id FROM bob, project;

-- UR10 Seed Data --
INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded)
SELECT project_id, 'report.pdf', 'projects/' || project_id || '/report.pdf', 5120, NOW()
FROM projects
WHERE project_name = 'Test Project';

INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
SELECT user_id, user_id, 'Empty Project', '2026-12-31', NOW(), NOW()
FROM users
WHERE username = 'alice';
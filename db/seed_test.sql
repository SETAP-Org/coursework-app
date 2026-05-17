-- UR1 Seed Data --
INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
VALUES ('John', 'Doe', 'jdoe@example.com', 'ms-johndoe', NOW(), NOW(), 'jdoe', FALSE)
RETURNING user_id;

-- UR3 Seed Data --
-- Test Seed Data --
-- Users: alice (team leader), bob (member), charlie (member, no completed tasks)
-- Projects: Test Project (alice, bob, charlie), Test Project 2 (alice only, no tasks)
-- Tasks: Test Task (To Do, alice, weight 1), Alice Completed Task (weight 3), Bob Completed Task (weight 1)

WITH alice AS (
    INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Alice', 'Leader', 'alice@example.com', 'ms-alice', NOW(), NOW(), 'alice', FALSE)
    RETURNING user_id
), bob AS (
    INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Bob', 'Member', 'bob@example.com', 'ms-bob', NOW(), NOW(), 'bob', FALSE)
    RETURNING user_id
), charlie AS (
    INSERT INTO USERS (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Charlie', 'Contrib', 'charlie@example.com', 'ms-charlie', NOW(), NOW(), 'charlie', FALSE)
    RETURNING user_id
), project AS (
    INSERT INTO PROJECTS (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    SELECT alice.user_id, alice.user_id, 'Test Project', '2099-12-31', NOW(), NOW()
    FROM alice
    RETURNING project_id, team_leader_id
), project2 AS (
    INSERT INTO PROJECTS (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    SELECT alice.user_id, alice.user_id, 'Test Project 2', '2099-12-31', NOW(), NOW()
    FROM alice
    RETURNING project_id
), task AS (
    INSERT INTO TASKS (project_id, assignee_id, task_title, task_description, task_weight, task_status, task_deadline, t_date_created, t_time_updated)
    SELECT project.project_id, alice.user_id, 'Test Task', 'Test Description', 1, 'To Do', '2099-12-31', NOW(), NOW()
    FROM alice, project
    RETURNING task_id
), completed_task_alice AS (
    INSERT INTO TASKS (project_id, assignee_id, task_title, task_weight, task_status, t_date_created, t_time_updated)
    SELECT project.project_id, alice.user_id, 'Alice Completed Task', 3, 'Completed', NOW(), NOW()
    FROM alice, project
    RETURNING task_id
), completed_task_bob AS (
    INSERT INTO TASKS (project_id, assignee_id, task_title, task_weight, task_status, t_date_created, t_time_updated)
    SELECT project.project_id, bob.user_id, 'Bob Completed Task', 1, 'Completed', NOW(), NOW()
    FROM bob, project
    RETURNING task_id
)

INSERT INTO USER_PROJECTS (user_id, project_id)
SELECT alice.user_id, project.project_id FROM alice, project
UNION ALL
SELECT bob.user_id, project.project_id FROM bob, project;

-- UR7 Seed Data --
WITH ur7_alice AS (
    INSERT INTO users (
        user_first_name,
        user_last_name,
        user_email,
        microsoft_id,
        date_created,
        last_login,
        username,
        email_notifications
    )
    VALUES ('UR7', 'Alice', 'ur7.alice@example.com', 'ms-ur7-alice', NOW(), NOW(), 'ur7alice', FALSE)
    RETURNING user_id
), ur7_bob AS (
    INSERT INTO users (
        user_first_name,
        user_last_name,
        user_email,
        microsoft_id,
        date_created,
        last_login,
        username,
        email_notifications
    )
    VALUES ('UR7', 'Bob', 'ur7.bob@example.com', 'ms-ur7-bob', NOW(), NOW(), 'ur7bob', FALSE)
    RETURNING user_id
), ur7_project AS (
    INSERT INTO projects (
        created_by,
        team_leader_id,
        project_name,
        project_deadline,
        p_date_created,
        p_time_updated
    )
    SELECT ur7_alice.user_id, ur7_alice.user_id, 'UR7 Chat Project', '2099-12-31', NOW(), NOW()
    FROM ur7_alice
    RETURNING project_id
)
INSERT INTO user_projects (user_id, project_id)
SELECT ur7_alice.user_id, ur7_project.project_id
FROM ur7_alice, ur7_project
UNION ALL
SELECT ur7_bob.user_id, ur7_project.project_id
FROM ur7_bob, ur7_project;

-- UR10 Seed Data --

INSERT INTO files (project_id, file_name, storage_path, size, date_uploaded)
SELECT project_id, 'report.pdf', 'projects/' || project_id || '/report.pdf', 5120, NOW()
FROM projects
WHERE project_name = 'Test Project';

INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
SELECT user_id, user_id, 'Empty Project', '2026-12-31', NOW(), NOW()
FROM users
WHERE username = 'alice';

-- UR 13 Seed Data --
WITH socket_alice AS (
    INSERT INTO users (
        user_first_name,
        user_last_name,
        user_email,
        microsoft_id,
        date_created,
        last_login,
        username,
        email_notifications
    )
    VALUES (
        'Socket',
        'Alice',
        'socket.alice@example.com',
        'ms-socket-alice',
        NOW(),
        NOW(),
        'socketalice',
        FALSE
    )
    RETURNING user_id
),

socket_bob AS (
    INSERT INTO users (
        user_first_name,
        user_last_name,
        user_email,
        microsoft_id,
        date_created,
        last_login,
        username,
        email_notifications
    )
    VALUES (
        'Socket',
        'Bob',
        'socket.bob@example.com',
        'ms-socket-bob',
        NOW(),
        NOW(),
        'socketbob',
        FALSE
    )
    RETURNING user_id
),

socket_charlie AS (
    INSERT INTO users (
        user_first_name,
        user_last_name,
        user_email,
        microsoft_id,
        date_created,
        last_login,
        username,
        email_notifications
    )
    VALUES (
        'Socket',
        'Charlie',
        'socket.charlie@example.com',
        'ms-socket-charlie',
        NOW(),
        NOW(),
        'socketcharlie',
        FALSE
    )
    RETURNING user_id
),

socket_project AS (
    INSERT INTO projects (
        created_by,
        team_leader_id,
        project_name,
        project_deadline,
        p_date_created,
        p_time_updated
    )
    SELECT
        socket_alice.user_id,
        socket_alice.user_id,
        'Socket Integration Project',
        '2099-12-31',
        NOW(),
        NOW()
    FROM socket_alice
    RETURNING project_id
)

INSERT INTO user_projects (user_id, project_id)

SELECT
    socket_alice.user_id,
    socket_project.project_id
FROM socket_alice, socket_project

UNION ALL

SELECT
    socket_bob.user_id,
    socket_project.project_id
FROM socket_bob, socket_project

UNION ALL

SELECT
    socket_charlie.user_id,
    socket_project.project_id
FROM socket_charlie, socket_project;

-- UR 14 Seed Data --

WITH john AS (
    INSERT INTO users (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('John', 'Smith', 'john@example.com', 'ms-john', NOW(), NOW(), 'john', FALSE)
    RETURNING user_id
), julia AS (
    INSERT INTO users (user_first_name, user_last_name, user_email, microsoft_id, date_created, last_login, username, email_notifications)
    VALUES ('Julia', 'Smith', 'julia@example.com', 'ms-julia', NOW(), NOW(), 'julia', FALSE)
    RETURNING user_id
), project AS (
    INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    SELECT john.user_id, john.user_id, 'AI Test Project', '2026-12-31', NOW(), NOW()
    FROM john
    RETURNING project_id
), memberships AS (
    INSERT INTO USER_PROJECTS (user_id, project_id)
    SELECT john.user_id, project.project_id FROM john, project
    UNION ALL
    SELECT julia.user_id, project.project_id FROM julia, project
    RETURNING *
)
INSERT INTO ai_chat_messages (project_id, user_id, role, content, ai_date_sent)
SELECT project.project_id, john.user_id, 'user'::ai_chat_role, 'What is the project status?',
    '2026-01-01T00:00:00Z'::TIMESTAMPTZ FROM john, project
UNION ALL
SELECT project.project_id, NULL, 'assistant'::ai_chat_role, 'The project is on track and all tasks are progressing as planned.',
    '2026-01-01T00:00:01Z'::TIMESTAMPTZ FROM project
UNION ALL
SELECT project.project_id, john.user_id, 'user'::ai_chat_role, 'What are the next steps?',
    '2026-01-01T00:00:02Z'::TIMESTAMPTZ FROM john, project
UNION ALL
SELECT project.project_id, NULL, 'assistant'::ai_chat_role, 'Complete current steps to receive future steps.',
    '2026-01-01T00:00:03Z'::TIMESTAMPTZ FROM project;

WITH julia AS (
    SELECT user_id FROM users WHERE microsoft_id = 'ms-julia'
), empty_project AS (
    INSERT INTO projects (created_by, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated)
    SELECT julia.user_id, julia.user_id, 'AI Empty Project', '2099-12-31', NOW(), NOW()
    FROM julia
    RETURNING project_id
)
INSERT INTO USER_PROJECTS (user_id, project_id)
SELECT julia.user_id, empty_project.project_id FROM julia, empty_project;

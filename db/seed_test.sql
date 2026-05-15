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
SELECT bob.user_id, project.project_id FROM bob, project
UNION ALL
SELECT charlie.user_id, project.project_id FROM charlie, project
UNION ALL
SELECT alice.user_id, project2.project_id FROM alice, project2;

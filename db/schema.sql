/*
CREATE TABLES FOR GROUP COURSEWORK PROJECT MANAGEMENT SYSTEM
*/

-- Make sure we start with a clean slate
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS meeting_location CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;

DROP TABLE IF EXISTS WIDGETS CASCADE;
DROP TABLE IF EXISTS MEETING_ATTENDANCES CASCADE;
DROP TABLE IF EXISTS MEETINGS CASCADE;
DROP TABLE IF EXISTS MESSAGES CASCADE;
DROP TABLE IF EXISTS NOTIFICATIONS CASCADE;
DROP TABLE IF EXISTS TASKS CASCADE;
DROP TABLE IF EXISTS USER_PROJECTS CASCADE;
DROP TABLE IF EXISTS PROJECTS CASCADE;
DROP TABLE IF EXISTS USERS CASCADE;

CREATE TABLE USERS(
    user_id SERIAL PRIMARY KEY,
    user_first_name VARCHAR(50) NOT NULL,
    user_last_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    date_created TIMESTAMP,
    last_login TIMESTAMP,
    UNIQUE (user_email)
);

CREATE TABLE PROJECTS(
    project_id SERIAL PRIMARY KEY,
    team_leader_id INT NOT NULL,
    project_board TEXT,
    project_name VARCHAR(50) NOT NULL,
    project_deadline DATE NOT NULL,
    p_date_created TIMESTAMP,
    p_time_updated TIMESTAMP,
    FOREIGN KEY (team_leader_id) REFERENCES USERS(user_id)
);

CREATE TABLE USER_PROJECTS(
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id)
);

CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Completed');

CREATE TABLE TASKS(
    task_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    task_title VARCHAR(100) NOT NULL,
    task_description TEXT,
    task_weight DECIMAL NOT NULL,
    task_status task_status NOT NULL,
    task_deadline DATE,
    t_date_created TIMESTAMP,
    t_time_updated TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id)
);

CREATE TYPE notification_type AS ENUM ('Task Assigned', 'Task Updated', 'Project Deadline Approaching', 'Message Received');

CREATE TABLE NOTIFICATIONS(
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    task_id INT,
    notification_type notification_type NOT NULL,
    notification_message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    n_date_created TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id),
    FOREIGN KEY (task_id) REFERENCES TASKS(task_id)
);

CREATE TABLE MESSAGES(
    message_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    project_id INT NOT NULL,
    message_content TEXT NOT NULL,
    m_date_sent TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES USERS(user_id),
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id)
);

CREATE TYPE meeting_location AS ENUM('Virtual', 'Presential');

CREATE TABLE MEETINGS(
    meeting_id SERIAL PRIMARY KEY,
    team_leader_id INT NOT NULL,
    project_id INT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    meeting_duration INT NOT NULL,
    meeting_location meeting_location,
    meeting_notes TEXT,
    FOREIGN KEY (team_leader_id) REFERENCES USERS(user_id),
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id)
);

CREATE TYPE attendance_status AS ENUM('Present', 'Not Present');

CREATE TABLE MEETING_ATTENDANCES(
    attendance_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    meeting_id INT NOT NULL,
    attendance_status attendance_status,
    check_in_time TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (meeting_id) REFERENCES MEETINGS(meeting_id)
);

CREATE TABLE WIDGETS(
    widget_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    widget_x DECIMAL NOT NULL,
    widget_y DECIMAL NOT NULL,
    widget_text VARCHAR(200),
    widget_height INT NOT NULL,
    widget_width INT NOT NULL,
    widget_data JSONB NOT NULL,
    FOREIGN KEY (project_id) REFERENCES PROJECTS(project_id)
);

-- Alterations to foreign keys to make them Cascade on Delete 

ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
  ADD CONSTRAINT tasks_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_project_id_fkey,
  ADD CONSTRAINT messages_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE widgets
  DROP CONSTRAINT IF EXISTS widgets_project_id_fkey,
  ADD CONSTRAINT widgets_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE user_projects
  DROP CONSTRAINT IF EXISTS user_projects_project_id_fkey,
  ADD CONSTRAINT user_projects_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_project_id_fkey,
  ADD CONSTRAINT notifications_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_task_id_fkey,
  ADD CONSTRAINT notifications_task_id_fkey
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
    ON DELETE CASCADE;

ALTER TABLE meetings
  DROP CONSTRAINT IF EXISTS meetings_project_id_fkey,
  ADD CONSTRAINT meetings_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE;

ALTER TABLE meeting_attendances
  DROP CONSTRAINT IF EXISTS meeting_attendances_meeting_id_fkey,
  ADD CONSTRAINT meeting_attendances_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id)
    ON DELETE CASCADE;

-- change users table, add email_notifications column
--ALTER TABLE users
--  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;

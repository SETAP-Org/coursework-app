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


CREATE TABLE public.meeting_attendances (
  attendance_id integer NOT NULL DEFAULT nextval('meeting_attendances_attendance_id_seq'::regclass),
  user_id integer NOT NULL,
  meeting_id integer NOT NULL,
  attendance_status USER-DEFINED,
  check_in_time timestamp without time zone NOT NULL,
  CONSTRAINT meeting_attendances_pkey PRIMARY KEY (attendance_id),
  CONSTRAINT meeting_attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT meeting_attendances_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id)
);
CREATE TABLE public.meetings (
  meeting_id integer NOT NULL DEFAULT nextval('meetings_meeting_id_seq'::regclass),
  team_leader_id integer NOT NULL,
  project_id integer NOT NULL,
  scheduled_time timestamp without time zone NOT NULL,
  meeting_duration integer NOT NULL,
  meeting_location USER-DEFINED,
  meeting_notes text,
  CONSTRAINT meetings_pkey PRIMARY KEY (meeting_id),
  CONSTRAINT meetings_team_leader_id_fkey FOREIGN KEY (team_leader_id) REFERENCES public.users(user_id),
  CONSTRAINT meetings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);
CREATE TABLE public.messages (
  message_id integer NOT NULL DEFAULT nextval('messages_message_id_seq'::regclass),
  sender_id integer NOT NULL,
  project_id integer NOT NULL,
  message_content text NOT NULL,
  m_date_sent timestamp without time zone,
  CONSTRAINT messages_pkey PRIMARY KEY (message_id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id),
  CONSTRAINT messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);
CREATE TABLE public.notifications (
  notification_id integer NOT NULL DEFAULT nextval('notifications_notification_id_seq'::regclass),
  user_id integer NOT NULL,
  project_id integer NOT NULL,
  task_id integer,
  notification_type USER-DEFINED NOT NULL,
  notification_message text,
  is_read boolean DEFAULT false,
  n_date_created timestamp without time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT notifications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id),
  CONSTRAINT notifications_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id)
);
CREATE TABLE public.projects (
  project_id integer NOT NULL DEFAULT nextval('projects_project_id_seq'::regclass),
  team_leader_id integer NOT NULL,
  project_name character varying NOT NULL,
  project_deadline date NOT NULL,
  p_date_created timestamp without time zone,
  p_time_updated timestamp without time zone,
  CONSTRAINT projects_pkey PRIMARY KEY (project_id),
  CONSTRAINT projects_team_leader_id_fkey FOREIGN KEY (team_leader_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.tasks (
  task_id integer NOT NULL DEFAULT nextval('tasks_task_id_seq'::regclass),
  project_id integer NOT NULL,
  task_title character varying NOT NULL,
  task_description text,
  task_weight numeric NOT NULL,
  task_status USER-DEFINED NOT NULL,
  task_deadline date,
  t_date_created timestamp without time zone,
  t_time_updated timestamp without time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (task_id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);
CREATE TABLE public.user_projects (
  user_id integer NOT NULL,
  project_id integer NOT NULL,
  CONSTRAINT user_projects_pkey PRIMARY KEY (user_id, project_id),
  CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT user_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  user_first_name character varying NOT NULL,
  user_last_name character varying NOT NULL,
  user_email character varying NOT NULL UNIQUE,
  date_created timestamp without time zone NOT NULL,
  last_login timestamp without time zone NOT NULL,
  microsoft_id text NOT NULL UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.widgets (
  widget_id integer NOT NULL DEFAULT nextval('widgets_widget_id_seq'::regclass),
  project_id integer NOT NULL,
  widget_x numeric NOT NULL,
  widget_y numeric NOT NULL,
  widget_text character varying,
  widget_height integer NOT NULL,
  widget_width integer NOT NULL,
  widget_data jsonb NOT NULL,
  CONSTRAINT widgets_pkey PRIMARY KEY (widget_id),
  CONSTRAINT widgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
);

--
-- PostgreSQL database dump
--

\restrict 1cZw8qPnqy5Wpr0GjSWsdAPxdvYx8T4LUaz8l6tbZoEJF5XHgdXiHWPHg5S3GdK

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.widgets DROP CONSTRAINT IF EXISTS widgets_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_projects DROP CONSTRAINT IF EXISTS user_projects_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_projects DROP CONSTRAINT IF EXISTS user_projects_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_team_leader_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.meetings DROP CONSTRAINT IF EXISTS meetings_team_leader_id_fkey;
ALTER TABLE IF EXISTS ONLY public.meetings DROP CONSTRAINT IF EXISTS meetings_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.meeting_attendances DROP CONSTRAINT IF EXISTS meeting_attendances_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.meeting_attendances DROP CONSTRAINT IF EXISTS meeting_attendances_meeting_id_fkey;
ALTER TABLE IF EXISTS ONLY public.widgets DROP CONSTRAINT IF EXISTS widgets_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_user_email_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_projects DROP CONSTRAINT IF EXISTS user_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.meetings DROP CONSTRAINT IF EXISTS meetings_pkey;
ALTER TABLE IF EXISTS ONLY public.meeting_attendances DROP CONSTRAINT IF EXISTS meeting_attendances_pkey;
ALTER TABLE IF EXISTS public.widgets ALTER COLUMN widget_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tasks ALTER COLUMN task_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.projects ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN notification_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN message_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.meetings ALTER COLUMN meeting_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.meeting_attendances ALTER COLUMN attendance_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.widgets_widget_id_seq;
DROP TABLE IF EXISTS public.widgets;
DROP SEQUENCE IF EXISTS public.users_user_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_projects;
DROP SEQUENCE IF EXISTS public.tasks_task_id_seq;
DROP TABLE IF EXISTS public.tasks;
DROP SEQUENCE IF EXISTS public.projects_project_id_seq;
DROP TABLE IF EXISTS public.projects;
DROP SEQUENCE IF EXISTS public.notifications_notification_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.messages_message_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.meetings_meeting_id_seq;
DROP TABLE IF EXISTS public.meetings;
DROP SEQUENCE IF EXISTS public.meeting_attendances_attendance_id_seq;
DROP TABLE IF EXISTS public.meeting_attendances;
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.meeting_location;
DROP TYPE IF EXISTS public.attendance_status;
--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: hfaulk
--

CREATE TYPE public.attendance_status AS ENUM (
    'Present',
    'Not Present'
);


ALTER TYPE public.attendance_status OWNER TO hfaulk;

--
-- Name: meeting_location; Type: TYPE; Schema: public; Owner: hfaulk
--

CREATE TYPE public.meeting_location AS ENUM (
    'Virtual',
    'Presential'
);


ALTER TYPE public.meeting_location OWNER TO hfaulk;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: hfaulk
--

CREATE TYPE public.notification_type AS ENUM (
    'Task Assigned',
    'Task Updated',
    'Project Deadline Approaching',
    'Message Received'
);


ALTER TYPE public.notification_type OWNER TO hfaulk;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: hfaulk
--

CREATE TYPE public.task_status AS ENUM (
    'To Do',
    'In Progress',
    'Completed'
);


ALTER TYPE public.task_status OWNER TO hfaulk;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: meeting_attendances; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.meeting_attendances (
    attendance_id integer NOT NULL,
    user_id integer NOT NULL,
    meeting_id integer NOT NULL,
    attendance_status public.attendance_status,
    check_in_time timestamp without time zone NOT NULL
);


ALTER TABLE public.meeting_attendances OWNER TO hfaulk;

--
-- Name: meeting_attendances_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.meeting_attendances_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meeting_attendances_attendance_id_seq OWNER TO hfaulk;

--
-- Name: meeting_attendances_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.meeting_attendances_attendance_id_seq OWNED BY public.meeting_attendances.attendance_id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.meetings (
    meeting_id integer NOT NULL,
    team_leader_id integer NOT NULL,
    project_id integer NOT NULL,
    scheduled_time timestamp without time zone NOT NULL,
    meeting_duration integer NOT NULL,
    meeting_location public.meeting_location,
    meeting_notes text
);


ALTER TABLE public.meetings OWNER TO hfaulk;

--
-- Name: meetings_meeting_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.meetings_meeting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meetings_meeting_id_seq OWNER TO hfaulk;

--
-- Name: meetings_meeting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.meetings_meeting_id_seq OWNED BY public.meetings.meeting_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    sender_id integer NOT NULL,
    project_id integer NOT NULL,
    message_content text NOT NULL,
    m_date_sent timestamp without time zone
);


ALTER TABLE public.messages OWNER TO hfaulk;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_message_id_seq OWNER TO hfaulk;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    task_id integer,
    notification_type public.notification_type NOT NULL,
    notification_message text,
    is_read boolean DEFAULT false,
    n_date_created timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO hfaulk;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO hfaulk;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    team_leader_id integer NOT NULL,
    project_name character varying(50) NOT NULL,
    project_deadline date NOT NULL,
    p_date_created timestamp without time zone,
    p_time_updated timestamp without time zone
);


ALTER TABLE public.projects OWNER TO hfaulk;

--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_project_id_seq OWNER TO hfaulk;

--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    project_id integer NOT NULL,
    task_title character varying(100) NOT NULL,
    task_description text,
    task_weight numeric NOT NULL,
    task_status public.task_status NOT NULL,
    task_deadline date,
    t_date_created timestamp without time zone,
    t_time_updated timestamp without time zone
);


ALTER TABLE public.tasks OWNER TO hfaulk;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO hfaulk;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.user_projects (
    user_id integer NOT NULL,
    project_id integer NOT NULL
);


ALTER TABLE public.user_projects OWNER TO hfaulk;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_first_name character varying(50) NOT NULL,
    user_last_name character varying(50) NOT NULL,
    user_email character varying(100) NOT NULL,
    date_created timestamp without time zone,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO hfaulk;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO hfaulk;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: widgets; Type: TABLE; Schema: public; Owner: hfaulk
--

CREATE TABLE public.widgets (
    widget_id integer NOT NULL,
    project_id integer NOT NULL,
    widget_x numeric NOT NULL,
    widget_y numeric NOT NULL,
    widget_text character varying(200),
    widget_height integer NOT NULL,
    widget_width integer NOT NULL,
    widget_data jsonb NOT NULL
);


ALTER TABLE public.widgets OWNER TO hfaulk;

--
-- Name: widgets_widget_id_seq; Type: SEQUENCE; Schema: public; Owner: hfaulk
--

CREATE SEQUENCE public.widgets_widget_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.widgets_widget_id_seq OWNER TO hfaulk;

--
-- Name: widgets_widget_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hfaulk
--

ALTER SEQUENCE public.widgets_widget_id_seq OWNED BY public.widgets.widget_id;


--
-- Name: meeting_attendances attendance_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meeting_attendances ALTER COLUMN attendance_id SET DEFAULT nextval('public.meeting_attendances_attendance_id_seq'::regclass);


--
-- Name: meetings meeting_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meetings ALTER COLUMN meeting_id SET DEFAULT nextval('public.meetings_meeting_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: widgets widget_id; Type: DEFAULT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.widgets ALTER COLUMN widget_id SET DEFAULT nextval('public.widgets_widget_id_seq'::regclass);


--
-- Data for Name: meeting_attendances; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.meeting_attendances (attendance_id, user_id, meeting_id, attendance_status, check_in_time) FROM stdin;
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.meetings (meeting_id, team_leader_id, project_id, scheduled_time, meeting_duration, meeting_location, meeting_notes) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.messages (message_id, sender_id, project_id, message_content, m_date_sent) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.notifications (notification_id, user_id, project_id, task_id, notification_type, notification_message, is_read, n_date_created) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.projects (project_id, team_leader_id, project_name, project_deadline, p_date_created, p_time_updated) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.tasks (task_id, project_id, task_title, task_description, task_weight, task_status, task_deadline, t_date_created, t_time_updated) FROM stdin;
\.


--
-- Data for Name: user_projects; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.user_projects (user_id, project_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.users (user_id, user_first_name, user_last_name, user_email, date_created, last_login) FROM stdin;
\.


--
-- Data for Name: widgets; Type: TABLE DATA; Schema: public; Owner: hfaulk
--

COPY public.widgets (widget_id, project_id, widget_x, widget_y, widget_text, widget_height, widget_width, widget_data) FROM stdin;
\.


--
-- Name: meeting_attendances_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.meeting_attendances_attendance_id_seq', 1, false);


--
-- Name: meetings_meeting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.meetings_meeting_id_seq', 1, false);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 1, false);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 1, false);


--
-- Name: tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.tasks_task_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- Name: widgets_widget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hfaulk
--

SELECT pg_catalog.setval('public.widgets_widget_id_seq', 1, false);


--
-- Name: meeting_attendances meeting_attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meeting_attendances
    ADD CONSTRAINT meeting_attendances_pkey PRIMARY KEY (attendance_id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (meeting_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: user_projects user_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_pkey PRIMARY KEY (user_id, project_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_user_email_key; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_email_key UNIQUE (user_email);


--
-- Name: widgets widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.widgets
    ADD CONSTRAINT widgets_pkey PRIMARY KEY (widget_id);


--
-- Name: meeting_attendances meeting_attendances_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meeting_attendances
    ADD CONSTRAINT meeting_attendances_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(meeting_id);


--
-- Name: meeting_attendances meeting_attendances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meeting_attendances
    ADD CONSTRAINT meeting_attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: meetings meetings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: meetings meetings_team_leader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_team_leader_id_fkey FOREIGN KEY (team_leader_id) REFERENCES public.users(user_id);


--
-- Name: messages messages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: notifications notifications_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: notifications notifications_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: projects projects_team_leader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_team_leader_id_fkey FOREIGN KEY (team_leader_id) REFERENCES public.users(user_id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: user_projects user_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: user_projects user_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.user_projects
    ADD CONSTRAINT user_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: widgets widgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hfaulk
--

ALTER TABLE ONLY public.widgets
    ADD CONSTRAINT widgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 1cZw8qPnqy5Wpr0GjSWsdAPxdvYx8T4LUaz8l6tbZoEJF5XHgdXiHWPHg5S3GdK


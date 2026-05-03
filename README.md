# Group Coursework Management System (GCMS)

A comprehensive web-based platform designed to streamline group coursework management for university students. This application addresses common challenges in academic collaboration by consolidating communication, task management, and file sharing into a single, integrated solution.

---

## .env Structure

`DATABASE_URL = postgresql://[username]:[password]@localhost:5432/gcms`

`SUPABASE_URL = https://[project-ref].supabase.co`

`SUPABASE_SERVICE_ROLE_KEY = [server-side-service-role-key]`

`SUPABASE_SHARED_FOLDERS_BUCKET = shared-folders`

<p>If you don't use a password for your psql, the url is just:</p> 

`postgresql://[username]@localhost:5432/gcms`

> Where [username] is what appears before `=#` when typing psql into a terminal window.
> This also assumes you have PostgreSQL configured to default to port `5432`

### Shared Folder Storage Notes

- `SUPABASE_SERVICE_ROLE_KEY` must only be used on the server.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser scripts.
- Use a private bucket for shared folders.
- This project now includes a reusable Supabase helper in `utils/supabase.js` for server-side storage operations.

## Overview
Managing group coursework often involves juggling multiple platforms—WhatsApp for communication, OneDrive for files, separate calendars for meetings, and informal methods for tracking contributions. Our platform eliminates this fragmentation by providing an **all-in-one solution** tailored specifically for student coursework projects.

---

## Key Features

* **Microsoft Integration:** Seamless authentication via university Microsoft accounts with OneDrive integration for file management.
* **Task Management:** Create, assign, and track tasks with customizable weights to ensure fair contribution tracking.
* **Shared Calendar:** Coordinate group meetings and deadlines with availability tracking across all team members.
* **Group Chat:** Dedicated communication channels for each project, keeping coursework discussions separate from personal messaging.
* **Interactive Project Board:** Collaborative workspace with draggable widgets for notes, reminders, and project organization.
* **Real-Time Notifications:** Stay updated on deadlines, task assignments, and project changes via email and in-app alerts.
* **Contribution Tracking:** Transparent system for monitoring individual contributions based on completed tasks.
* **Team Leadership Tools:** Assign and manage team leaders with appropriate permissions for project oversight.
* **AI-Powered Assistant:** Summarize and clarify coursework specifications using integrated AI capabilities.

---

## Built With

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML, CSS, Javascript |
| **Backend** | Express.js |
| **Libraries** | EmailJS (notifications), Konva.js (project board) |
| **External APIs** | Microsoft Graph API, OpenAI API |
| **Architecture** | Layered event-driven architecture with centralized event bus |

---

## The Problem We're Solving
Based on extensive user research with **15 interviews and a focus group**, we identified three critical pain points:

1.  **Platform Fragmentation:** Students use 3-5 different applications per project, leading to cognitive overhead and missed communications.
2.  **Lack of Accountability:** Verbal task assignments without written records result in unclear responsibilities and unequal contributions.
3.  **Meeting Coordination:** Finding common availability across team members wastes significant time at the start of every project.

---

## Target Users
University students working on group coursework projects across all disciplines, with an initial focus on those with Microsoft/Office 365 university accounts.

> **Project Context:** Developed by Group 5B for the Software Engineering Theory & Practice (SETaP) module


## Check status of Postgre
sc query postgresql-x64-18

## if not running use this 
net start postgresql-x64-18

## if running 
netstat -ano | findstr :5432

## if stopped 
net start postgresql-x64-18

## psql dictionary 
sc qc postgresql-x64-18

## in the case tcp ip is broken 
C:\Program Files\PostgreSQL\18\data\postgresql.conf

## find these lines 
#listen_addresses = 'localhost'
#port = 5432

## chamge to these 
listen_addresses = '*'
port = 5432

## chage these 
C:\Program Files\PostgreSQL\18\data\pg_hba.conf

host    all     all     127.0.0.1/32    trust
host    all     all     ::1/128         trust

## password devpass
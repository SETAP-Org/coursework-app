# Group Coursework Management System (GCMS)
**GCMS** is a web application to help students manage their group coursework projects.

## Overview
GCMS has been developed to best suit students at the [University of Portsmouth](https://www.port.ac.uk/), however it can be used by anyone with a Microsoft account, meaning it is perfect for any group university students looking for a better way to manage their group coursework projects!

The features will be described and outlined in the below [section](#features).

For those wishing to contribute to the project, you are welcome to fork this repository and follow the below [instructions](#installation) to get started!

## Demo
Add a link here to the demo video

## Installation
### Prerequisites
This is a simple list of tech you must have installed and configured to be able to develop **GCMS**. If you do not have any of the below installed, please see the respective official websites for more information on how to do so (linked below).
- [PostgreSQL 18+](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/en)
- [Git](https://git-scm.com/install/)
- [Microsoft Account](https://account.microsoft.com/account)

### Steps
1. Clone the GitHub repository, and install all Node.js dependencies.
```bash
git clone https://github.com/SETAP-Org/group-coursework-management-system.git
npm install
```

2. Create the required .env files
Based on [this](https://gcms-docs.readthedocs.io/en/latest/getting-started/environment-configuration.html) page in the documentation, set-up the .env files as described.

3. Install the database
In a terminal opened to the root folder of the project, run:
```bash
npm run install_db
```

> For any troubleshooting, or more information, see the in-depth documentation linked [below](#contributing).

## Usage
1. Run the app
```bash
npm run dev # For developing the app
```

```bash
npm run prod # For deployment
```

2. Open the server in your browser of choice, by navigating to the link below
```plaintext
http://localhost:3000
```

## Features
### Task Management
GCMS provides the user with a straightforward, clear task tracking system. It allows a project's 'team leader' to assign tasks to a project's members, including assigning deadlines to tasks to keep members accountable. All users in a project are able to see everyone's tasks, and can see who is completing tasks on time vs. who is going over the deadines. Tasks are also assigned weights, to make the contribution tracking as accurate as possible - a bigger task can have a bigger weighting to give the assignee a higher contribution % for completing that task.

SCREENSHOT

### Deadline Monitoring
All projects and tasks are assigned a deadline. This allows users to clearly see how long they have until each project and task is due. The deashboard automatically colours tasks/projects in amber and red for close to and over deadlines respectively.

SCREENSHOT, showing an overdue task, a near task, and a 'comfortable' task

### Calendar Integrations
Within a project, you can create a meeting on the calendar page. This will display for all members of a project, and will also integrate into your Microsoft calendar, utilising the [Microsoft Graph API](#tech-stack).

### Live Project Group Chat
Each project has a chat page, which gives the members access to unlimited messaging between anybody in the group. The page updates in real-time, allowing for seamless integration. The group chat feature integrates with the notification system to keep members informed, even if they aren't on the message page.

SCREENSHOT

### Contribution Tracking
GCMS allows users to easily track group member contributions, so users never have to have those awkward chats! On the contributions page, users and able to view a pie-chart to visualise the individual contribution points for all members assigned to the group. These points are calculated based on the weighting of the tasks each member has completed.

SCREENSHOT

### User-Specific Notification System
All users have access to a notifications viewer, where they can view any updates and changes with any project they are assigned to. If they receive a message from one project, a new task from another, they will always be able to stay up-to-date.

SCREENSHOT

### Interactive Project Board
A collaborative workspace featuring draggable widgets for notes, reminders, and project organization, built seamlessly into the project dashboard using Konva.js.

SCREENSHOT showing the interactive notes board

### Multiple Concurrent Project Capabilities
Any user is able to have a theoretically unlimited number of active projects at one time. This allows them to keep track of as many group coursework projects they may have assigned to them across multiple modules on their course.

SCREENSHOT of lots of projects

## Tech Stack
### Frontend
- **Languages**: HTML, CSS, Javascript
- **Templated** with EJS
- **Libraries**: Konva.js

### Backend & Database
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time updating**: Socket.io
- **Authentication**: Passport.js

### External Integrations
- **Microsoft Graph API**

## Contributing
All the information regarding contributing to the project can be found in the project's in-depth [documentation](https://gcms-docs.readthedocs.io/en/latest/index.html). This goes into all the details on contributing, with detailed troubleshooting steps should they be required. We want anybody to be able to contribute with as little hassle as possible!

## License
MIT License, see `LICENSE` file for more details.

## Acknowledgements
This project was developed by Group5B for the Software Engineering Theory & Practice (SETaP) module at the [University of Portsmouth](https://www.port.ac.uk/).

We would like to say an extra thanks to:
- **Our focus group participants** - For providing the initial user research and pain points that shaped the core features of GCMS.

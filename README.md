# Group Coursework Management System (GCMS)
**GCMS** is a web application to help students manage their group coursework projects.

## Overview
GCMS has been developed to best suit students at the [University of Portsmouth](https://www.port.ac.uk/), however it can be used by anyone with a Microsoft account, meaning it is perfect for any group university students looking for a better way to manage their group coursework projects!

The features will be described and outlined in the below [section](#features).

For those wishing to contribute to the project, you are welcome to fork this repository and follow the below [instructions](#installation) to get started!

> AI Usage: AI tools, such as Anthropic Claude, have been utilised throughout development as a code reviewer and to help with certain areas such as CSS styling and for the implementation of more advanced features to ensure a thorough understanding of theory has been reached among contributors

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
## Automated Testing 
```bash 
npm run test #for running the autometed tests with jest 
```

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
GCMS provides the user with a straightforward, clear task tracking system. It allows a project's 'team leader' to assign tasks to a project's members, including assigning deadlines to tasks to keep members accountable. All users in a project are able to see everyone's tasks, and can see who is completing tasks on time vs. who is going over the deadlines. Tasks are also assigned weights, to make the contribution tracking as accurate as possible - a bigger task can have a bigger weighting to give the assignee a higher contribution % for completing that task.

<img width="2841" height="1517" alt="image" src="https://github.com/user-attachments/assets/0b5380a3-d192-4a42-b773-b6ccee923f5e" />

### Deadline Monitoring
All projects and tasks are assigned a deadline. This allows users to clearly see how long they have until each project and task is due. The dashboard automatically colours tasks/projects in amber and red for close to and over deadlines respectively.

<img width="2841" height="1517" alt="image" src="https://github.com/user-attachments/assets/1e226142-5f8f-4843-8d1c-98c206047328" />

### Calendar Integrations
Within a project, you can create a meeting on the calendar page. This will display for all members of a project, and will also integrate into your Microsoft calendar, utilising the [Microsoft Graph API](#tech-stack).

### Live Project Group Chat
Each project has a chat page, which gives the members access to unlimited messaging between anybody in the group. The page updates in real-time, allowing for seamless integration. The group chat feature integrates with the notification system to keep members informed, even if they aren't on the message page.

<img width="2817" height="1515" alt="image" src="https://github.com/user-attachments/assets/84db5304-a8f2-49bd-a55c-88a5afb0203c" />

### Contribution Tracking
GCMS allows users to easily track group member contributions, so users never have to have those awkward chats! On the contributions page, users are able to view a pie-chart to visualise the individual contribution points for all members assigned to the group. These points are calculated based on the weighting of the tasks each member has completed.

<img width="2812" height="1515" alt="image" src="https://github.com/user-attachments/assets/bf27f29d-942e-4c06-a146-fe3aecb927e9" />

### User-Specific Notification System
All users have access to a notifications viewer, where they can view any updates and changes with any project they are assigned to. If they receive a message from one project, a new task from another, they will always be able to stay up-to-date.

<img width="2841" height="1522" alt="image" src="https://github.com/user-attachments/assets/08c35c87-8483-4705-bfff-4f673924f477" />

### Interactive Project Board
A collaborative workspace featuring draggable widgets for notes, reminders, and project organization, built seamlessly into the project dashboard using Konva.js.

<img width="2841" height="1517" alt="image" src="https://github.com/user-attachments/assets/d347e564-a9f1-4459-8fa1-77f1e8bc3d2d" />

### Shared File System
All users in a project are able to upload files to a shared folder in the app. They can then download the individual files, or ask the in-built AI chatbot to tell them about the files that have been uploaded.

<img width="2841" height="1522" alt="image" src="https://github.com/user-attachments/assets/2127eedf-5807-4d1c-8d85-8c4796d8fc37" />

### Context-Aware AI Chatbot
Any user can open the AI chat menu in the bottom left of every project related page, and ask any question they want regarding the uploaded files. The AI is able to read all files uploaded to have context regarding the selected project.

<img width="2841" height="1522" alt="image" src="https://github.com/user-attachments/assets/cb2152ef-aa0a-4f20-b902-2a56423e3508" />

## Tech Stack
### Frontend
- **Languages**: HTML, CSS, Javascript
- **Templated** with EJS
- **Libraries**: Konva.js, Chart.js

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
MIT License, see [`LICENSE`](LICENSE) file for more details.

## Contributors
hfaulk - Harry Faulkner - up2305969

jaymckerracher - Jay McKerracher - up2306458

marqueese - Marcus Thomas - up2271401

Jaketh444 - Jake Friend - up2274964

angeloenrico123 - Angelo Espirito Santo Mansur Paixao - up2267576

tjw-all - Tom Waller - up2212528

## Acknowledgements
This project was developed by Group5B for the Software Engineering Theory & Practice (SETaP) module at the [University of Portsmouth](https://www.port.ac.uk/).

We would like to say an extra thanks to:
- **Our focus group participants** - For providing the initial user research and pain points that shaped the core features of GCMS.

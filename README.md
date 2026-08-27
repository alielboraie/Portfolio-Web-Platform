# Portfolio Web Platform

A role-based web platform for managing student portfolios, academic projects, collaboration, and internships.

The system connects **Students**, **Course Instructors**, **Employers**, and **Administrators** in one place so users can:
- build and showcase portfolios,
- manage projects and thesis drafts,
- collaborate through invitations, tasks, comments, and messages,
- handle internship posting and applications,
- monitor platform activity with notifications and statistics.

---

## Overview

This project was built to support the full portfolio lifecycle in an academic environment, from profile creation to project evaluation and internship outcomes.

It includes:
- Multi-role authentication and dashboards
- Portfolio and project management
- Collaboration and feedback workflows
- Internship marketplace features
- Admin governance and moderation tools

---

## User Roles

- **Student**
- **Course Instructor**
- **Employer**
- **Administrator**

Each role has dedicated permissions and dashboard functionality.

---

## Core Features

## 1) Authentication & Account Management
- Login/logout for all roles
- Registration flows for students, instructors, and employers
- Password reset via OTP
- Account activation/deactivation (admin)

## 2) Profiles & Portfolios
- Student portfolio CRUD (major, skills, LinkedIn, etc.)
- Instructor profile CRUD (bio, research interests, education)
- Employer profile CRUD (company details, logo, location)
- Profile pictures and supporting document uploads
- Portfolio discovery via search, filtering, and sorting

## 3) Courses & Instructor Linking
- Instructor course linking/unlinking
- Admin approval/rejection for link requests
- Course management (create/view/update/delete)
- Instructor and course-based search

## 4) Projects & Thesis Workflow
- Project CRUD (title, course, GitHub link, languages, video, etc.)
- Project visibility controls (public/private)
- Thesis draft uploads and final draft selection
- Collaborator and instructor invitations (send/cancel/accept/reject)
- Project task management (create/edit/delete/reorder)
- Commenting and feedback from instructors
- Project rating workflow

## 5) Notifications & Messaging
- Role-aware notification center
- Read/unread notification tracking
- Private messaging between users
- Notification controls (including disabling notifications)

## 6) Moderation & Compliance
- Flagging inappropriate projects (e.g., plagiarism)
- Student appeals for flagged projects
- Admin review of flagged content and appeals
- Project activation/deactivation controls

## 7) Favorites & Recommendations
- Save/remove favorite projects and portfolios
- View favorites lists
- Recommended project suggestions

## 8) Internship Management
- Employer internship CRUD
- Archive/unarchive internship posts
- Student internship search, filter, sort, and apply
- Employer application review and status management (e.g., nominated/accepted/rejected)
- Internship completion reflected in student portfolio

## 9) Analytics & Statistics
- Platform usage statistics (admin)
- Student and internship-related statistics
- Project/portfolio activity insights

---

## Tech Stack

- **Frontend:** React
- **Language:** JavaScript
- **Styling:** CSS
- **Package Manager:** npm

---

## Project Structure

```text
Portfolio-Web-Platform/
├── public/
├── src/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm start
```

The app will run on:  
`http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## Environment Variables

Create a `.env` file for local configuration (do not commit secrets).

Example:
```env
REACT_APP_API_URL=https://example.com/api
```

Also keep these in `.gitignore`:
```gitignore
.env
.env.*
```

---

## Current Status

This repository currently contains the frontend implementation and mock/data-driven flows for key platform features.  
Future work may include backend integration, persistent storage, and deployment-ready infrastructure.

---

## Roadmap

- Backend/API integration
- Database and authentication hardening
- File storage service integration
- Improved test coverage
- CI/CD and deployment pipeline
- UI/UX refinements

---

## Authors

- Ali El Boraie
- Omar Hammad
- Hadi Mahmoud

---

## License

This project is for educational/academic use unless otherwise specified.

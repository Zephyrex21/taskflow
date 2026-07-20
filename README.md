# TaskFlow

A collaborative task management app built by a 3-person team to practice
professional Git and GitHub workflows — branching, pull requests, code
review, merge conflict resolution, and deployment.

## Team

| Name | Role | Responsibility |
|---|---|---|
| Saurabh | Backend / Core API | Task CRUD, business logic |
| Gaurav | Frontend | UI, dashboard, API integration |
| Sumit | Auth & Integration/DevOps | Auth system, middleware, CI/CD |

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Atlas)
- **Frontend:** React (Vite)
- **Auth:** JWT
- **Deployment:** Railway/Render (backend), Vercel (frontend)
- **CI:** GitHub Actions

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── models/          # Task.js, User.js
│   │   ├── routes/          # task.routes.js, auth.routes.js, health.routes.js
│   │   ├── controllers/     # taskController.js, authController.js
│   │   ├── middleware/      # verifyToken.js, errorHandler.js
│   │   ├── config/          # env.js, db.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/                 # Vite + React starter, UI work in progress
│   └── package.json
├── docs/
│   └── API_CONTRACT.md      # endpoint reference (coming soon)
├── PROJECT_BLUEPRINT.pdf    # full plan: roles, schema, API contract, workflow
├── .gitignore
└── README.md
```

## Getting Started

```bash
git clone https://github.com/Code-Orbit-Lab/taskflow.git
cd taskflow

# backend
cd backend
npm install
cp .env.example .env   # then fill in your own MONGO_URI and JWT_SECRET
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

## API Overview

| Endpoint | Method | Status |
|---|---|---|
| `/api/auth/register` | POST | ✅ Live |
| `/api/auth/login` | POST | ✅ Live |
| `/api/auth/me` | GET | ✅ Live |
| `/api/tasks` | GET, POST | ✅ Live (JWT protected) |
| `/api/tasks/:id` | GET, PUT, DELETE | ✅ Live (JWT protected) |
| `/api/tasks/:id/status` | PATCH | ✅ Live (JWT protected) |
| `/api/health` | GET | ✅ Live |

All task and profile routes require a valid `Authorization: Bearer <token>`
header, issued by `/api/auth/register` or `/api/auth/login`.

## Branching & Contribution Flow

We follow a strict pull → branch → code → commit → push → PR → review →
merge loop. No one pushes directly to `main`. Branches are short-lived and
scoped to one feature. See the Project Blueprint for full details.

## Current Status

🚧 In active development.

- ✅ Backend & frontend scaffolding merged
- ✅ Task model, CRUD API, and routes merged
- ✅ Backend restructured into `backend/` (package.json, lockfile, env moved out of root)
- ✅ JWT auth system merged — register, login, `/me`, real `verifyToken` middleware
- ✅ Repo moved to the Code-Orbit-Lab organization
- 🚧 Frontend login/register/dashboard pages — in progress
- ⏳ API contract doc, CI pipeline, deployment — not started yet


my self sumit
# Team Task Manager

A full-stack web application for managing projects, assigning tasks to team members, and tracking progress — with role-based access control (Admin/Member).

**Live URL:** _[Add your Railway URL here after deployment]_

---

## Features

- **Authentication** — Secure Signup/Login with JWT & HttpOnly cookies
- **Role-Based Access Control** — Admin and Member roles with different permissions
- **Project Management** — Create, edit, delete projects (Admin); view assigned projects (Member)
- **Team Management** — Add/remove members to projects (Admin)
- **Task Assignment** — Assign tasks to **multiple members** simultaneously
- **Status Tracking** — Task status (Todo → In Progress → Completed), Project status (Active/On Hold/Completed)
- **Progress Tracking** — Auto-computed project progress based on task completion %
- **Dashboard** — Stats overview, project progress bars, recent tasks
- **Activity Logging** — Tracks status changes, task creation, and reassignments

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS v4, Wouter, Axios |
| **Backend** | Node.js, Express 5, Sequelize ORM |
| **Database** | MySQL |
| **Deployment** | Railway |

## Role-Based Access

| Action | Admin | Member |
|---|---|---|
| See all projects | ✅ | ❌ (only assigned) |
| Create/edit/delete projects | ✅ | ❌ |
| Add/remove project members | ✅ | ❌ |
| Create/assign tasks | ✅ | ❌ |
| View tasks | ✅ (all) | ✅ (assigned only) |
| Update task status | ✅ | ✅ (own tasks) |

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middlewares/    # Auth & role middleware
│   ├── models/         # Sequelize models (User, Project, Task, etc.)
│   ├── routes/         # Express routes
│   ├── services/       # Business logic layer
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components (Button, Card, etc.)
│   │   ├── contexts/   # Auth context
│   │   ├── pages/      # Dashboard, Projects, Tasks, Profile, Login, Signup
│   │   ├── services/   # API client (Axios)
│   │   └── App.jsx     # Router
│   └── vite.config.js
├── package.json        # Root scripts for deployment
└── README.md
```

## Local Setup

### Prerequisites
- Node.js >= 18
- MySQL installed and running

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Setup Database
```sql
CREATE DATABASE task_manager_db;
```

### 3. Configure Environment
Create `backend/.env`:
```env
PORT=5000
DB_NAME=task_manager_db
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Backend runs on `http://localhost:5000`, Frontend on `http://localhost:5173`.

## Deployment (Railway)

### Steps:
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add **MySQL** addon (New → Database → MySQL)
4. Set environment variables in Railway:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_secret_key`
   - `MYSQL_URL` = _(auto-set by Railway MySQL addon)_
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Railway auto-deploys on every push

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | Token | Get current user |
| POST | `/api/auth/logout` | Token | Logout |
| GET | `/api/projects` | Token | List projects (role-filtered) |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/tasks` | Token | List tasks (role-filtered) |
| GET | `/api/tasks/stats` | Token | Task statistics |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Token | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/users/active` | Token | List active users |

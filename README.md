# Multi-Tenant Task Management System

A scalable, secure, and multi-tenant task management system built with the PERN stack (Postgres, Express, React, Node.js).

## Features
- **Multi-tenancy**: Strict data isolation between organizations.
- **Role-Based Access Control (RBAC)**: Admin and Member roles with different permissions.
- **Audit Logging**: Tracks all task-related actions (Creation, Updates, Deletions).
- **Authentication**: JWT-based secure authentication.
- **Containerization**: Fully dockerized setup for easy deployment.
- **Premium UI**: Modern dark-mode design with glassmorphism and smooth animations.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites
- Docker & Docker Compose installed on your machine.

### Run with Docker (Recommended)
1. Clone the repository.
2. Navigate to the root directory.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:3000` and the backend at `http://localhost:5000`.

### Manual Setup (Local)
1. **Database**: Ensure PostgreSQL is running and create a database named `taskmanager`.
2. **Backend**:
   - `cd backend`
   - `npm install`
   - Update `.env` with your `DATABASE_URL`.
   - `npx prisma migrate dev --name init`
   - `npm start`
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Roles & Permissions
- **Admin**: Can create, view, and delete ANY task within their organization. Can view audit logs for the entire organization.
- **Member**: Can create tasks. Can only view/delete tasks they created.

## API Documentation
- `POST /api/auth/signup`: Create a new user and organization.
- `POST /api/auth/login`: Authenticate and get JWT.
- `GET /api/tasks`: Get all tasks for your organization.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/:id`: Update a task (RBAC enforced).
- `DELETE /api/tasks/:id`: Delete a task (RBAC enforced).
- `GET /api/tasks/logs`: View organization audit logs (Admin only).

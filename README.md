# 🚀 TM PRO - Multi-Tenant Task Workspace

**TM PRO** is multi-tenant SaaS platform designed for high-performance team collaboration. Built with a focus on security, scalability, and premium user experience, it features strict data isolation, role-based access control (RBAC), and deep audit logging.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Postgres%20%7C%20Docker-blue?style=for-the-badge)

---

## ✨ Key Features

### 🏢 Multi-Tenancy & Data Isolation

- **Strict Scoping**: Every database record is linked to a unique `organizationId`.
- **Zero Leakage**: Security middleware ensures users can only access data belonging to their specific organization.

### 🔐 Advanced Authentication & Security

- **JWT Token Rotation**: Secure Access + Refresh token system with automatic rotation via Axios interceptors.
- **OAuth 2.0**: Integrated Google SSO for seamless enterprise onboarding.
- **RBAC (Role-Based Access Control)**:
  - **ADMIN**: Full visibility into organization tasks, analytics, and audit trails.
  - **MEMBER**: Focused workspace limited to personal tasks and project objectives.

### 📊 Business Intelligence & Analytics

- **Live Velocity Charts**: Real-time visualization of task throughput using Recharts.
- **Resource Management**: Tracking efficiency, health scores, and backlog depth.
- **Activity Stream**: A live audit trail of all actions performed within the organization.

### 🛠️ Production-Grade Infrastructure

- **Docker Orchestration**: Multi-container environment with PostgreSQL, Node.js, and Nginx.
- **Modular Backend**: Clean architecture using the Model-Controller-Service-Route pattern.
- **Modern UI**: Linear/Vercel inspired dark-mode interface built with **Tailwind CSS v4** and Framer Motion.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React, Recharts, Framer Motion.
- **Backend**: Node.js, Express, Prisma ORM, Passport.js (OAuth), JWT.
- **Database**: PostgreSQL (Production), SQLite (Local Dev).
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
- Node.js v18+ (for local development)

### Option 1: Docker (Production-Ready)

The fastest way to spin up the entire environment:

```powershell
docker-compose up --build
```

- **Frontend**: `http://localhost`
- **Backend API**: `http://localhost:5000`

### Option 2: Local Development

1. **Setup Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm start
   ```
2. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── middlewares/   # Auth & Security
│   │   └── services/      # Audit & Utils
│   ├── prisma/            # Database schema
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Premium UI Components
│   │   └── api.js         # Secure Axios config
│   ├── nginx.conf         # Production routing
│   └── Dockerfile
└── docker-compose.yaml    # Full stack orchestration
```

---

## 🔒 Security Architecture

**TM PRO** implements industry-standard security protocols:

- **Password Hashing**: Uses `bcryptjs` for secure credential storage.
- **Access Control**: Middlewares verify both JWT validity and Tenant ownership on every request.
- **Persistent Audit Logs**: Every `CREATE`, `UPDATE`, and `DELETE` action creates a JSON snapshot of the state change for accountability.

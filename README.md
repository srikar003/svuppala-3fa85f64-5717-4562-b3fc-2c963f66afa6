# 🚀 Secure Task Management System (NX Monorepo)
 
**Tech Stack:** NX · NestJS · Angular · TypeScript · JWT · RBAC · SQLite · TailwindCSS

---

## 📌 Overview

This project implements a **secure Task Management System** using **role-based access control (RBAC)** in a **modular NX monorepo**.  
Users authenticate using **JWT**, and access to resources is strictly controlled based on **roles** and **organizational scope**.

The system supports secure authentication, fine-grained authorization, task management, drag-and-drop UX, audit logging, and clean modular architecture.

---

## 🗂️ Monorepo Structure (NX Workspace)

```
apps/
├── api/            # NestJS backend (JWT, RBAC, Tasks, Audit)
├── dashboard/      # Angular frontend (Tasks UI, Insights UI)
├── auth/           # Reusable RBAC decorators & guards
├── data/           # Shared DTOs / interfaces
```

---

## 🔐 Authentication & Authorization

### Authentication
- Implemented using **JWT**
- Login endpoint issues a signed JWT
- Token payload includes:
  - `sub` → user ID
  - `role` → Owner | Admin | Viewer
  - `orgId` → organization scope
- JWT is required for all protected endpoints

### Authorization (RBAC)

| Role   | View Tasks | Create | Edit | Delete | View Audit |
|--------|------------|--------|------|--------|------------|
| Owner  | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin  | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

- RBAC enforced using **NestJS Guards & Decorators**
- Viewer role is strictly read-only
- Permissions are enforced in both backend and frontend

---

## 🏢 Data Model & ERD

### Core Entities
- **User**
  - id, email, passwordHash
  - role (Owner/Admin/Viewer)
  - organizationId
- **Organization**
  - Supports a 2-level hierarchy
- **Task**
  - title, description, category
  - status: Todo | InProgress | Done
  - order (for drag-and-drop)
  - organizationId
- **AuditLog**
  - user, role, action, resource, timestamp

### Entity Relationship Diagram (ERD)

```
+-------------------+        +----------------------+
|   Organization    |        |        User          |
+-------------------+        +----------------------+
| id (PK)           |<-------| id (PK)              |
| name              |   1    | email (unique)       |
| parentOrgId (FK)  |        | passwordHash         |
+-------------------+        | role                 |
                             | organizationId (FK)  |
                             +----------+-----------+
                                        |
                                        | 1
                                        |
                             +----------v-----------+
                             |        Task          |
                             +----------------------+
                             | id (PK)              |
                             | title                |
                             | description           |
                             | category              |
                             | status                |
                             | order                 |
                             | organizationId (FK)   |
                             | createdBy (FK)        |
                             +----------------------+

+----------------------+
|     AuditLog         |
+----------------------+
| id (PK)              |
| userId (FK)          |
| role                 |
| action               |
| resource             |
| timestamp            |
+----------------------+
```

---

## 🧠 Access Control Implementation

- JWT Guard validates authentication
- Roles Guard validates permissions
- Organization ID scopes data visibility
- Viewer:
  - Cannot create/edit/delete tasks
  - Drag-and-drop disabled
- Owner/Admin:
  - Full access within org scope
- Audit logs capture allow/deny decisions

---

## 🧾 API Endpoints

### Authentication
```
POST /auth/login
```

### Tasks
```
POST   /tasks        # Create task (Owner/Admin)
GET    /tasks        # List accessible tasks
PUT    /tasks/:id    # Edit task (Owner/Admin)
DELETE /tasks/:id    # Delete task (Owner/Admin)
```

### Audit
```
GET /audit-log       # Owner/Admin only
```

All endpoints require:
```
Authorization: Bearer <JWT>
```

---

## 🖥️ Frontend (Angular + TailwindCSS)

### Features
- Login UI with JWT authentication
- Task board:
  - Create / Edit / Delete (role-aware)
  - Drag-and-drop ordering & status changes
  - Filters & categories
- **Insights Page**
  - Task completion percentage
  - Progress bar visualization
  - Category distribution
- Fully responsive design

### Role-Aware UX
- Viewer sees read-only UI
- Restricted actions hidden/disabled
- Visual role indicator displayed

---

## 🧪 Testing Strategy

### Backend
- Unit tests for:
  - Authentication logic
  - RBAC rules
  - Guards
  - Controller logic

*(End-to-end tests intentionally excluded as per clarified scope.)*

### Frontend
- Role-based behavior verified
- Component logic separated for testability

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- npm

### Install dependencies
```bash
npm install
```

### Run SQLite
```bash
npx ts-node -P tsconfig.base.json -r tsconfig-paths/register -r dotenv/config api/src/seed.ts
```

### Run Backend
```bash

npx nx serve api
```
API runs at: `http://localhost:3000`

### Run Frontend
```bash
npx nx serve dashboard
```
Dashboard runs at: `http://localhost:4200`

---

## 🔑 Demo Credentials

| Role   | Email             | Password        |
|--------|------------------|-----------------|
| Owner  | owner@demo.com   | Password123!    |
| Admin  | admin@demo.com   | Password123!    |
| Viewer | viewer@demo.com  | Password123!    |

---

## 📁 Environment Variables

**api/.env**
```
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=3600s
```

---

## 🚧 Future Enhancements

- JWT refresh tokens
- Fine-grained permission matrix
- RBAC caching
- Organization delegation
- Real-time updates (WebSockets)
- Persistent audit logging

---

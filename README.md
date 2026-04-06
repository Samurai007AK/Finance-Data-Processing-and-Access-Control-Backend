# Finance Dashboard Backend API

This repository contains the backend implementation for a Finance Dashboard system. It is built using **Node.js, Express, and TypeScript** to ensure high maintainability, type safety, and clear separation of concerns.

## Architecture & Decisions
1. **In-Memory Store vs Relational Database**: As permitted in the assignment flexibility guidelines, I opted to use an in-memory `Map` data structure for persistence. This makes the project extremely easy to run immediately without needing to set up a database, mock data, or deal with tricky environment configurations for SQLite.
2. **Structure**: The app follows a straightforward layered architecture using Express Router for routes, controllers for business logic, and middlewares for access control.
3. **Validation**: I used `Zod` for schema validation because it is strictly typed. Invalid inputs are caught by a global error handler that returns formatted HTTP 400 responses.
4. **Authentication**: JWT is used for sessions. Passwords are authentically hashed using `bcrypt` to simulate a real-world secure system requirement.
5. **Role Bootstrapping**: To make it simpler to test out the API, the very first user who registers automatically becomes an `ADMIN`. Any users who register after that will be assigned the `VIEWER` role by default, which can be upgraded by the admin.

## System Requirements
- Node.js (v18+ recommended)
- `npm`

## Setup & Run Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:3000` with hot-reloading powered by `tsx`.*

## Core Features & Access Control

The logic utilizes an RBAC (Role-Based Access Control) hierarchy enforced via Express middleware:
- **VIEWER**: Can access analytics summary.
- **ANALYST**: Inherits Viewer permissions. Can fetch/view raw financial records.
- **ADMIN**: Inherits Analyst permissions. Can perform CRUD on ALL records, and change user roles/status.

## API Documentation

### 1. Authentication
* `POST /api/auth/register` - Register a new account. Body: `{ "email": "admin@test.com", "password": "password123" }`
* `POST /api/auth/login` - Authenticate and receive a JWT. Body: `{ "email": "admin@test.com", "password": "password123" }`

### 2. User Management (Requires `ADMIN` Role)
Ensure you pass `Authorization: Bearer <TOKEN>` in the headers.

* `GET /api/users` - List all users.
* `PUT /api/users/:id/role` - Update a user's role. Body: `{ "role": "ANALYST" }`
* `PUT /api/users/:id/status` - Deactivate/Activate a user. Body: `{ "status": "INACTIVE" }`

### 3. Financial Records
* `POST /api/records` - (Admin only) Create a record.
  * Body: `{ "amount": 100, "type": "INCOME", "category": "Salary", "date": "2026-04-01T00:00:00Z", "description": "April Salary" }`
* `GET /api/records` - (Analyst/Admin) View records.
  * Supports Query Params: `?category=Salary&type=INCOME&startDate=...&endDate=...`
* `GET /api/records/:id` - (Analyst/Admin) View a single record.
* `PUT /api/records/:id` - (Admin only) Update a record.
* `DELETE /api/records/:id` - (Admin only) Delete a record.

### 4. Dashboard Analytics
* `GET /api/analytics/summary` - (Viewer/Analyst/Admin) Get aggregated dashboard metrics. Includes:
  * `totalIncome`, `totalExpenses`, `netBalance`
  * `categoryTotals` (Key-value map of spending/earning per category)
  * `recentActivity` (Top 5 chronological records)

# SWOMS — Staff Workload & Overload Management System (Injibara University)

A staff workload and overload management system built for Injibara University, focusing on staff assignments, workload calculations, overload detection, reporting, and related academic management features.

---

## Table of Contents

- Overview
- Tech stack
- Repository structure
- Quick start
- Environment variables
- Running (dev & prod)
- API overview
- Database & migrations
- Testing
- Deployment
- Contributing
- License & contact

---

## Overview

`SWOMS` (Staff Workload & Overload Management System) is a modular full-stack application developed for Injibara University to manage staff workloads, course assignments, overload detection, reporting, and related academic operations.

Key features:

- Authentication and role-based access
- Academic year, colleges, departments, programs, courses and sections management
- Course requests and course assignments
- Workload calculation and overload detection
- Exporting and workload reports

---

## Tech Stack

- Backend: Node.js, Express
- Frontend: React, Vite, Tailwind CSS
- Database: configurable via `backend/src/config/database.js` (Postgres/MySQL/Mongo supported by project code)
- Dev tooling: nodemon (or equivalent), ESLint, Vite

---

## Repository Structure

- `backend/`
  - `package.json` — backend dependencies and scripts
  - `server.js` — backend entrypoint
  - `src/config/` — `database.js`, `env.js`, constants and seed data
  - `src/routes/` — route definitions (one file per feature)
  - `src/controllers/` — controller handlers implementing business logic
  - `src/models/` — data models / schemas
  - `src/middleware/` — `auth.js`, `errorHandler.js`

- `frontend/`
  - `package.json` — frontend dependencies and scripts
  - `index.html`, `src/main.jsx` — frontend entry
  - `src/pages/`, `src/components/`, `src/api/` — UI and API helpers

Refer to these paths for implementation details: [backend/package.json](backend/package.json), [backend/server.js](backend/server.js), [frontend/package.json](frontend/package.json), [frontend/src/main.jsx](frontend/src/main.jsx)

---

## Quick Start — Prerequisites

- Node.js v16+ (recommended)
- A database server (Postgres, MySQL, or MongoDB depending on your configuration)
- npm or yarn

### Backend

Install dependencies and run in development:

```bash
cd backend
npm install
npm run dev
```

The backend server entry is `backend/server.js` and routes are under `backend/src/routes`.

### Frontend

Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file for the backend (copy from `.env.example`) with values appropriate for your environment.

Typical backend variables (see `backend/src/config/env.js` for exact keys):

- `PORT` — server port (e.g., `4000`)
- `DB_HOST` — database host
- `DB_PORT` — database port
- `DB_USER` — database username
- `DB_PASS` — database password
- `DB_NAME` — database name
- `JWT_SECRET` — secret used to sign JWT tokens
- `NODE_ENV` — `development` or `production`

Frontend may also rely on environment variables for API base URLs; create `frontend/.env` if needed.

---

## Running

Development

```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

Production (recommended approach)

1. Build the frontend: `cd frontend && npm run build`.
2. Serve the static build from a static host or configure the backend to serve files from `frontend/dist`.
3. Start the backend with a process manager (PM2, systemd, etc.).

Example using PM2:

```bash
pm2 start backend/server.js --name swoms-backend
```

---

## API Overview

Routes are organized by feature in `backend/src/routes`. Important groups include:

- Authentication: [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js)
- Academic year: [backend/src/routes/academic-year.routes.js](backend/src/routes/academic-year.routes.js)
- Programs & ProgramYear: [backend/src/routes/program.routes.js](backend/src/routes/program.routes.js), [backend/src/routes/programYear.routes.js](backend/src/routes/programYear.routes.js)
- Courses, Sections, Staff, Workload reports: see respective route files in `backend/src/routes`

Controllers implementing the route logic live in `backend/src/controllers` and models in `backend/src/models`.

Middleware for auth and errors is located at `backend/src/middleware`.

---

## Database & Migrations

Database connection is configured in `backend/src/config/database.js`. If migrations or ORM tooling are required, check `backend/package.json` scripts and `backend/src/models` for hints.

Seed or sample data may be available in `backend/src/config/AllData.js`.

---

## Testing

If tests exist, they are in `backend/test/`. Run them with:

```bash
cd backend
npm test
```

If no tests exist, consider adding unit tests for controllers, integration tests for routes, and E2E tests for critical user flows.

---

## Deployment

- Use environment variables for secrets and DB credentials.
- Consider Dockerizing both frontend and backend and use `docker-compose` to run the app and DB together.
- Recommended hosting: cloud VMs, container services, or serverless/static hosts for frontend (Vercel, Netlify) and a Node-capable host for backend.

---

## Contributing

- Fork the repo, create a feature branch, implement your change, and open a PR.
- Follow existing code style and lint rules.
- Add tests for new behavior.

---

## Troubleshooting

- Backend fails to start: check `.env` values and database connectivity.
- Frontend cannot reach backend: check CORS and correct API base URL in the frontend config (`vite.config.js` or runtime env variables).

---

## License

Add a `LICENSE` file to the repository (e.g., MIT) to specify project licensing.

---

## Contact

If you'd like, I can also add `.env.example` files for backend and frontend, Docker files, or write CI workflows. Reply with what you'd like next.

# CaseLink / TourFirma

CaseLink is a SaaS-style workspace for travel agencies. It helps agents create tour package offers, publish public SSR pages, collect leads, and manage basic CRM workflow from one dashboard.

## What Is Inside

- NestJS backend API for auth, agencies, packages, public offer pages, leads, bookings and payments
- Next.js frontend workspace in `web/`
- PostgreSQL and Redis support through Docker Compose
- JWT based authentication, without Keycloak
- Public package pages with SSR and Open Graph metadata
- Package builder with content blocks such as hotel, flight, included services, program, gallery, map, document and notes

## Tech Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, Redis, JWT
- Frontend: Next.js, React
- Infrastructure: Docker, Docker Compose

## Project Structure

```text
Tour_Agent/
  tour_back/              NestJS backend modules
  web/                    Next.js frontend app
  frontend/               Older static frontend prototype
  docker-compose.yml      PostgreSQL, Redis and backend services
  Dockerfile              Backend Docker image
  package.json            Backend and root scripts
  README.md
```

## Requirements

Install these first:

- Node.js 20+
- npm
- Docker Desktop
- Git

## Environment Variables

Create a `.env` file in the project root. Example:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5544
DB_HOST=localhost
DB_NAME=tour
DATABASE_URL=postgres://postgres:your_password@localhost:5544/tour
ADMIN_PORT=5005
REDIS_PORT=6380
REDIS_HOST=localhost
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=10d
FILE_BASE_URL=http://localhost:5005/uploads
```

For the frontend, create `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5005
```

## Install Dependencies

Install backend dependencies:

```powershell
npm install
```

Install frontend dependencies:

```powershell
cd web
npm install
cd ..
```

## Run Database And Redis

Start PostgreSQL and Redis:

```powershell
docker compose up -d db redis
```

Backend local connection uses:

- PostgreSQL: `localhost:5544`
- Redis: `localhost:6380`

## Run Backend

```powershell
npm run start:dev
```

Backend API will run at:

```text
http://localhost:5005
```

## Run Frontend

In another terminal:

```powershell
npm run dev
```

Frontend will run at:

```text
http://localhost:3000
```

## Build

Build backend:

```powershell
npm run build
```

Build frontend:

```powershell
npm run web:build
```

## Docker Run

To run backend with PostgreSQL and Redis through Docker Compose:

```powershell
docker compose up --build
```

Services:

- Backend: `http://localhost:5005`
- PostgreSQL: `localhost:5544`
- Redis: `localhost:6380`

## Main Features

### Authentication

- Register creates an owner account automatically
- Users cannot choose their own role during registration
- Team roles such as manager or agent should be added later through invite/team management

### Agency Workspace

- Agency profile stores brand and contact information
- Package creation requires agency setup
- Dashboard shows launch readiness and sales metrics

### Package Builder

Agents can create a package with:

- Title, destination, price, pax, dates and description
- Hotel block
- Flight block
- Included services block
- Program block
- Gallery block
- Map block
- Document block
- Note block

### Public Pages

Published packages can be opened as public SSR pages:

```text
http://localhost:3000/p/package-slug
```

These pages are prepared for Open Graph previews.

### Leads

Lead module stores client requests coming from public package pages. The dashboard shows lead count, new leads and package performance.

## Useful Commands

```powershell
npm run start:dev      # backend development
npm run build          # backend build
npm run dev            # frontend development
npm run web:build      # frontend build
npm run web:start      # frontend production start
```

## GitHub Push

If your current branch is `master`:

```powershell
git add .
git commit -m "Update CaseLink platform"
git push origin master
```

## Notes

- Do not commit real production secrets to GitHub.
- Keep `.env` values different for local, staging and production.
- The current frontend is in `web/`; the `frontend/` folder is an older static prototype.
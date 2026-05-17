# Job Tracker — Tech Stack

This document defines the technologies used in this monorepo. New work should align with these choices unless explicitly changed here.

## Repository layout

| Package   | Path      | Role                          |
| --------- | --------- | ----------------------------- |
| `client`  | `/client` | Web UI (browser)              |
| `api`     | `/api`    | HTTP API and business logic   |

---

## Client (`/client`)

| Layer        | Choice              | Notes |
| ------------ | ------------------- | ----- |
| UI library   | **React 19**        | Current major line for components and hooks |
| Compiler     | **React Compiler**  | `babel-plugin-react-compiler` — automatic memoization and fewer manual `useMemo` / `useCallback` |
| Language     | **TypeScript**      | Strict typing across the app |
| Build / dev  | **Vite**            | Dev server, HMR, and production builds |
| Linting      | **ESLint**          | React Hooks and refresh plugins |

The client talks to the API over HTTP (REST or future conventions defined in the API).

---

## API (`/api`)

| Layer        | Choice              | Notes |
| ------------ | ------------------- | ----- |
| Framework    | **NestJS**          | Modular structure, DI, guards, pipes, and testing utilities |
| Language     | **TypeScript**      | Shared language with the client |
| Runtime      | **Node.js**         | Via Nest CLI (`nest start`, `nest build`) |
| Testing      | **Jest**            | Unit and e2e (`supertest` for HTTP) |

---

## Data & persistence

| Concern      | Choice              | Notes |
| ------------ | ------------------- | ----- |
| Database     | **PostgreSQL**      | Primary relational store |
| ORM          | **Prisma**          | Schema, migrations, and type-safe queries from the API |
| Admin UI     | **pgAdmin**         | Local inspection and ad-hoc SQL (development for now) |

Prisma lives in the API package: schema and migrations under `api/prisma/`, client generated for Nest services.

---

## Local development (Docker)

| File | Purpose |
| ---- | ------- |
| `docker-compose.yml` | Dev stack: PostgreSQL, pgAdmin, API, client |
| `docker-compose.prod.yml` | Stub for future production overrides |
| `api/Dockerfile.dev` | Dev API image (used by Compose) |
| `client/Dockerfile.dev` | Dev client image (used by Compose) |
| `.env.example` | Copy to `.env` before `docker compose up` |

```bash
cp .env.example .env
docker compose up --build
```

- App UI: http://localhost:5173  
- API: http://localhost:3000  
- pgAdmin: http://localhost:5050 (register server host `postgres`, port `5432`)

Production images: planned under `docker/prod/` (see `docker/prod/README.md`).

## Planned / not in repo yet

- Prisma schema, migrations, and generated client in the API

---

## Version reference (current)

Values reflect `package.json` at the time this doc was written; bump here when you upgrade majors.

- **React**: 19.x (`client`)
- **NestJS**: 11.x (`api`)
- **Prisma / PostgreSQL / pgAdmin**: adopt current stable releases when integrated

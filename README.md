# Cashy

Personal finance app for tracking salary, services, savings goals and expenses.

- **Backend**: Node.js + Express + TypeScript, PostgreSQL via Prisma, JWT auth, Zod validation.
- **Frontend**: React + Vite + TypeScript, Tailwind CSS (Atomic Design + BEM), React Query, Zustand, React Hook Form.

## Repo layout

```
.
├── backend/                # Express API (layered: routes → controllers → services → repositories)
│   ├── prisma/
│   │   ├── schema.prisma   # Usuario, Sueldo, Servicio, Meta, Gasto, Comida, Gimnasio, Ahorro
│   │   └── seed.ts         # Demo user + sample data
│   └── src/
│       ├── controllers/
│       ├── middlewares/    # auth (JWT), validate (Zod), error
│       ├── repositories/   # Prisma data access
│       ├── routes/
│       ├── schemas/        # Zod schemas
│       ├── services/       # business logic
│       └── utils/          # jwt, password (bcrypt), httpError
└── frontend/               # Vite SPA
    └── src/
        ├── components/
        │   ├── atoms/      # Button, Input, Badge, ProgressBar, ...
        │   ├── molecules/  # ItemCard, AhorroCard, FormField, ...
        │   ├── organisms/  # DashboardHeader, modals, sections
        │   └── templates/  # AuthLayout, DashboardLayout (responsive shell + nav)
        ├── pages/          # Login, Registro, Dashboard, Gastos, Comida, Gimnasio, Ahorros, Mas
        ├── hooks/          # React Query hooks per domain
        ├── services/api/   # fetch client + domain API modules
        ├── store/          # Zustand: user session
        └── styles/         # Tailwind entry + component classes (BEM)
```

## Prerequisites

- Node.js 18+
- PostgreSQL: local (Homebrew `postgresql@18`) or a Supabase project (remote)

## Setup

### 1. Database (local PostgreSQL)

If you don't have a Supabase project yet, use the local PostgreSQL installed via Homebrew:

```bash
# start the server (brew services has a bug with postgresql@18, use pg_ctl)
/opt/homebrew/bin/pg_ctl -D /opt/homebrew/var/postgresql@18 -l /opt/homebrew/var/log/postgresql@18.log start

# create the database
createdb cashy
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# set DATABASE_URL / DIRECT_URL, e.g. postgresql://<user>@localhost:5432/cashy
npm run prisma:migrate   # creates tables (alias of prisma migrate dev)
npm run prisma:seed      # creates demo user
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### Demo credentials

| Email           | Password  | Notes                          |
| --------------- | --------- | ------------------------------ |
| `demo@cashy.app` | `demo1234` | Seeded user with salary + data |

Run `npm run prisma:seed` (idempotent) anytime to re-create it.

## Scripts

Backend (`backend/`):

| Command                  | Description                       |
| ------------------------ | --------------------------------- |
| `npm run dev`            | Dev server (tsx watch)            |
| `npm run build`          | Compile TypeScript                |
| `npm run typecheck`      | Type-check without emitting       |
| `npm run prisma:migrate` | Apply migrations (`migrate dev`)  |
| `npm run prisma:seed`    | Seed demo user                    |
| `npm run prisma:studio`  | Prisma Studio UI                  |

Frontend (`frontend/`):

| Command             | Description               |
| ------------------- | ------------------------- |
| `npm run dev`       | Vite dev server           |
| `npm run build`     | Type-check + production build |
| `npm run typecheck` | Type-check only           |

## Environment variables

Backend (`.env`, see `.env.example`):

| Variable                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `DATABASE_URL`           | Prisma datasource URL                        |
| `DIRECT_URL`             | Direct connection URL (for migrations)       |
| `NODE_ENV`               | `development` \| `test` \| `production`      |
| `PORT`                   | API port (default `4000`)                    |
| `CORS_ORIGIN`            | Allowed frontend origin                      |
| `JWT_ACCESS_SECRET`      | Secret for access tokens                     |
| `JWT_REFRESH_SECRET`     | Secret for refresh tokens                    |
| `JWT_ACCESS_EXPIRES_IN`  | e.g. `15m`                                   |
| `JWT_REFRESH_EXPIRES_IN` | e.g. `7d`                                    |

Frontend (optional `.env`): `VITE_API_URL` (default `http://localhost:4000/api`).

## API

Base URL: `http://localhost:4000/api`. Protected routes require `Authorization: Bearer <accessToken>`.

| Method   | Path                | Auth | Description                    |
| -------- | ------------------- | ---- | ------------------------------ |
| `GET`    | `/health`           | –    | Health check                   |
| `POST`   | `/auth/register`    | –    | Create account                 |
| `POST`   | `/auth/login`       | –    | Login → access + refresh token |
| `POST`   | `/auth/refresh`     | –    | Refresh access token           |
| `GET`    | `/auth/me`          | ✓    | Current user + salary          |
| `GET`    | `/dashboard`        | ✓    | Summary (balance, income, etc.)|
| `GET`    | `/sueldo`           | ✓    | Get salary                     |
| `PUT`    | `/sueldo`           | ✓    | Create/update salary           |
| `GET`    | `/servicios`        | ✓    | List services                  |
| `POST`   | `/servicios`        | ✓    | Create service                 |
| `PATCH`  | `/servicios/:id`    | ✓    | Update service                 |
| `DELETE` | `/servicios/:id`    | ✓    | Delete service                 |
| `GET`    | `/metas`            | ✓    | List savings goals             |
| `POST`   | `/metas`            | ✓    | Create goal                    |
| `PATCH`  | `/metas/:id`        | ✓    | Update goal                    |
| `DELETE` | `/metas/:id`        | ✓    | Delete goal                    |
| `GET`    | `/gastos`           | ✓    | List variable expenses         |
| `POST`   | `/gastos`           | ✓    | Create variable expense        |
| `DELETE` | `/gastos/:id`       | ✓    | Delete variable expense        |
| `GET`    | `/comidas`          | ✓    | List food expenses             |
| `POST`   | `/comidas`          | ✓    | Create food expense            |
| `DELETE` | `/comidas/:id`      | ✓    | Delete food expense            |
| `GET`    | `/gimnasio`         | ✓    | List gym expenses              |
| `POST`   | `/gimnasio`         | ✓    | Create gym expense             |
| `DELETE` | `/gimnasio/:id`     | ✓    | Delete gym expense             |
| `GET`    | `/ahorros`          | ✓    | List savings                   |
| `POST`   | `/ahorros`          | ✓    | Create savings goal            |
| `POST`   | `/ahorros/:id/aportes` | ✓ | Add contribution to savings    |
| `DELETE` | `/ahorros/:id`      | ✓    | Delete savings goal            |
| `GET`    | `/ai/status`        | ✓    | Whether the AI assistant is enabled |
| `GET`    | `/ai/insights`      | ✓    | AI financial notifications     |
| `POST`   | `/ai/chat`          | ✓    | Chat with the Cashy assistant  |
| `POST`   | `/ai/actions`       | ✓    | Execute AI-proposed actions (after user confirmation) |

## Persistence

All sections are backed by the API and PostgreSQL: salary, services, savings goals, variable expenses, food, gym and savings. Nothing is hardcoded: a new account starts empty and every change is persisted. The `Gastos`, `Comida`, `Gimnasio` and `Ahorros` pages use the same layered backend as the rest of the app.

## AI assistant

Optional feature powered by OpenCode Go/Zen (`OPENCODE_*` env vars in `backend/.env`). It provides:

- **Insights** (`GET /api/ai/insights`): AI-generated financial notifications, cached in memory for 1 hour.
- **Chat** (`POST /api/ai/chat`): ask things like "¿Cómo van mis gastos del mes?" in text or with the browser's speech dictation (Web Speech API), with optional text-to-speech playback.
- **Actions** (`POST /api/ai/actions`): the assistant can propose changes (add/delete gastos, comida, gimnasio, ahorros; contribute to a savings goal). It never writes on its own: the UI shows a confirmation card and the backend executes only after the user confirms.

If `OPENCODE_API_KEY` is not set, the AI endpoints degrade gracefully (the chat button is hidden and insights return empty).

## Switching to Supabase

The backend already targets Postgres via Prisma, so moving to Supabase is a config change only:

1. Replace `DATABASE_URL` / `DIRECT_URL` in `backend/.env` with the Supabase connection strings (see `.env.example`).
2. Run `npx prisma migrate deploy` to apply migrations to the remote database.
3. Optionally run `npx prisma db seed`.
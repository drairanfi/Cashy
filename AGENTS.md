# AGENTS.md

Guidance for AI agents working on the Cashy repository.

## Project overview

Cashy is a personal finance app (salary, services, savings goals, expenses, food, gym, categories, AI assistant). Monorepo with two packages (no root workspaces):

- `backend/` — Express + TypeScript API, PostgreSQL via Prisma, JWT auth, Zod validation, layered architecture. (npm)
- `frontend/` — Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui, domain-driven frontend, seeded from `JoseCortezz25/template-starter-nextjs`. (pnpm)

The frontend is a client-only Next app that talks to the Express API (`NEXT_PUBLIC_API_URL`, default `http://localhost:4001/api`). The backend is the single source of truth for data and auth.

## Commands

Backend (`backend/`):

```bash
npm run dev            # tsx watch src/index.ts — dev server on :4001
npm run build          # tsc
npm run typecheck      # tsc --noEmit
npm run prisma:migrate # prisma migrate dev
npm run prisma:seed    # tsx prisma/seed.ts — idempotent demo user
npm run prisma:studio  # prisma studio
```

Frontend (`frontend/`, pnpm):

```bash
pnpm install
pnpm dev               # next dev — dev server on :3000
pnpm build             # next build
pnpm lint              # eslint src
pnpm typecheck         # tsc --noEmit
```

Always run the relevant typecheck/lint/build after changes.

## Architecture

### Backend: layered Express

Request flow: **routes → controllers → services → repositories**. See the code layout under `backend/src/` (controllers, services, repositories, middlewares, schemas, config, utils). Auth is stateless JWT (access + refresh). `register` and `login` return `{ user, tokens }`; the frontend stores tokens and refreshes on 401.

### Frontend: Next.js App Router, domain-driven

Follow the conventions in `frontend/AGENTS.md` (and `frontend/RULES.md`): atomic design for shared UI, domain folders for feature logic, shadcn/ui primitives, Tailwind v4. Server state is fetched from the Express API from client components (the API requires `Authorization: Bearer <token>`).

## Conventions

- **Artifacts**: code identifiers, comments, UI copy and docs default to English, except the existing project copy which is Spanish (Rioplatense, voseo: "Configurá", "Agregá"). Domain names use Spanish nouns: `Usuario`, `Sueldo`, `Servicio`, `Meta`, `Gasto`, `Deuda`.
- **Currency**: Colombian peso (COP); amounts formatted with thousand separators.
- **Commits**: conventional commits, no AI attribution/Co-Authored-By.

## Gotchas & learnings

- **Postgres start**: `brew services start postgresql@18` crashes. Start with:
  `/opt/homebrew/bin/pg_ctl -D /opt/homebrew/var/postgresql@18 -l /opt/homebrew/var/log/postgresql@18.log start`
- **Local DB**: Homebrew superuser role is the macOS username (no password). Current URLs: `postgresql://ESTUDIO@localhost:5432/cashy`.
- **`.env`**: not committed. `DATABASE_URL` and `DIRECT_URL` are both required by `backend/src/config/env.ts`.
- **Node version**: the frontend template wants Node 24; Node 22 builds fine (warning only). Frontend uses pnpm (`packageManager: pnpm@10.29.3`).
- **AI assistant**: optional, configured with `OPENCODE_*` env vars in `backend/.env`. Endpoints under `/api/ai/*`. If `OPENCODE_API_KEY` is missing, endpoints degrade gracefully.
- **Dev servers run in background** on this machine. Check with `pgrep -fl "tsx watch|next dev"`.
- **API surface**: base `/api`; health check is `/health` (no prefix).

## Database workflow

- Schema: `backend/prisma/schema.prisma` (Usuario, Sueldo, Servicio, Meta, Gasto, Comida, Gimnasio, Ahorro, Categoria, Deuda).
- Apply changes: `cd backend && npm run prisma:migrate -- --name <change>`.
- Regenerate client after schema changes: `cd backend && npm run prisma:generate`.

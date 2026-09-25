# AGENTS.md

Guidance for AI agents working on the Cashy repository.

## Project overview

Cashy is a personal finance app (tracking salary, services, savings goals and expenses) built as two packages in this monorepo (no root workspaces, no git repo yet):

- `backend/` — Express + TypeScript API, PostgreSQL via Prisma, JWT auth, Zod validation, layered architecture.
- `frontend/` — Vite + React + TypeScript SPA, Tailwind CSS v3 with Atomic Design + BEM, React Query, Zustand, React Hook Form.

## Commands

Backend (`backend/`):

```bash
npm run dev            # tsx watch src/index.ts — dev server on :4000
npm run build          # tsc
npm run typecheck      # tsc --noEmit
npm run prisma:migrate # prisma migrate dev
npm run prisma:seed    # tsx prisma/seed.ts — idempotent demo user
npm run prisma:studio  # prisma studio
```

Frontend (`frontend/`):

```bash
npm run dev            # vite — dev server on :5173
npm run build          # tsc -b && vite build
npm run typecheck      # tsc -b --noEmit
```

Always run `npm run typecheck` (and `npm run build` for the frontend) after changes.

## Architecture

### Backend: layered Express

Request flow: **routes → controllers → services → repositories**.

- `src/routes/` — mount paths and middleware, keep them thin.
- `src/controllers/` — translate HTTP (body/req.user) into use-case calls, build responses, `next(err)` on failure.
- `src/services/` — business logic and use cases (e.g. `registerUseCase`), throw `HttpError(status, message)`.
- `src/repositories/` — the only place that touches Prisma.
- `src/middlewares/` — `authenticate` (verifies `Authorization: Bearer` JWT, sets `req.user.id`), `validate` (Zod), `errorMiddleware`.
- `src/schemas/` — Zod schemas, one per resource, exported alongside inferred input types.
- `src/config/` — `env` (Zod-validated `process.env`), `prisma` client instance.
- `src/utils/` — `jwt`, `password` (bcryptjs), `httpError`.

Auth is stateless JWT (access + refresh). `register` and `login` return `{ user, tokens }`. The frontend stores tokens in `localStorage` and refreshes automatically on 401.

### Frontend: Atomic Design + BEM

- `components/atoms/` — Button, Input, Badge, ProgressBar, ColorIndicator, SaldoStateIndicator.
- `components/molecules/` — composed atoms: FormField, ItemCard, AhorroCard, PageHeader, MetaCard, ServicioCard, modals headers/dialogs.
- `components/organisms/` — self-contained blocks: DashboardHeader, sections (Metas/Servicios), modals (ModalServicio, ModalMeta, ModalConfigurarSueldo, ModalGasto, ModalAhorro, ModalAporte).
- `components/templates/` — AuthLayout, DashboardLayout (responsive shell: sidebar on `lg+`, bottom nav on mobile).
- `pages/` — route components (Login, Registro, Dashboard, Gastos, Comida, Gimnasio, Ahorros, Mas).
- `store/` — Zustand: `userStore` (session).
- `hooks/` — React Query hooks per domain (`useDashboard`, `useServicios`, `useMetas`, `useSueldo`).
- `services/api/` — `client.ts` (fetch wrapper with token refresh + `clearTokens`/`hasSession`) and per-domain modules.

State split: **server state** (Dashboard, Sueldo, Servicios, Metas, Gastos, Comida, Gimnasio, Ahorros, AI) → React Query; **client state** (session) → Zustand.

## Conventions

- **Artifacts**: code identifiers, comments, UI copy and docs default to English, except the existing project copy which is Spanish (Rioplatense, voseo: "Configurá", "Agregá") — keep new UI strings consistent with that voice. Domain names use Spanish nouns: `Usuario`, `Sueldo`, `Servicio`, `Meta`.
- **Styling**: Tailwind component classes are defined once in `src/styles/globals.css` under `@layer components` using `@apply` + BEM naming (`btn btn--primary`, `item-card__delete`). Prefer extending those classes over inline utilities.
- **Forms**: react-hook-form + `zodResolver`. Always type `useForm<T>` explicitly when passing both `resolver` and `defaultValues` (RHF infers `TFieldValues` from `defaultValues` alone otherwise).
- **Types**: resource types live in `src/types/index.ts` (frontend). Zod input types are exported from their schema file.
- **Validation**: all body input is validated with Zod middleware on the backend (`validate(schema)`).
- **Commits**: conventional commits, no AI attribution/Co-Authored-By.
- **Comments**: do not add comments unless they carry real value.

## Gotchas & learnings

- **Postgres start**: `brew services start postgresql@18` crashes (`undefined method 'stop_timeout'`). Start with:
  `/opt/homebrew/bin/pg_ctl -D /opt/homebrew/var/postgresql@18 -l /opt/homebrew/var/log/postgresql@18.log start`
- **Local DB**: Homebrew superuser role is the macOS username (no password). Current URLs: `postgresql://ESTUDIO@localhost:5432/cashy`. `createdb cashy` was already run.
- **`.env`**: not committed. `DATABASE_URL` and `DIRECT_URL` are both required by `env.ts`. Backup of the original placeholder file: `backend/.env.local-backup`.
- **Supabase migration path**: the app works against any Postgres. To go to Supabase, only change `DATABASE_URL`/`DIRECT_URL` and run `npx prisma migrate deploy`. Do NOT invent placeholder hosts — a URL with `<ref>`/`<password>` fails with P1013.
- **Seed**: `npm run prisma:seed` creates `demo@cashy.app` / `demo1234` with no data (idempotent).
- **All sections are API-backed**: Dashboard, Sueldo, Servicios, Metas, Gastos, Comida, Gimnasio and Ahorros read/write via the API and PostgreSQL. There is no in-memory mock data; new accounts start empty.
- **AI assistant**: optional, configured with `OPENCODE_*` env vars. `services/ai.service.ts` calls the OpenCode Go endpoint with `fetch`; `services/ai-tools.ts` defines the function-calling tools. Chat can propose actions (add/delete movimientos, aportar ahorro) but never writes directly: the UI sends confirmed actions to `POST /api/ai/actions`. If `OPENCODE_API_KEY` is missing, endpoints degrade gracefully.
- **Dev servers run in background** on this machine (started with `(npm run dev &)`). Check with `pgrep -fl "tsx watch|vite"`. Stop with `pkill -f "tsx watch"` / `pkill -f vite`. Killing the backend causes "Failed to fetch" in the UI.
- **Frontend auth**: session is a token in `localStorage`; `hasSession()` gates routes. `Mas` page clears tokens + redirects to `/login`.
- **API surface**: base `/api`; health check is `/health` (no prefix). See README.md for the endpoint table.

## Database workflow

- Schema: `backend/prisma/schema.prisma` (Usuario, Sueldo, Servicio, Meta — Spanish domain names).
- Apply changes: `npm run prisma:migrate -- --name <change>`.
- Inspect: `npm run prisma:studio`.
- Regenerate client after schema changes: `npm run prisma:generate`.
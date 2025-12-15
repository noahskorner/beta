# Repository Guidelines

Welcome to this Turborepo-based Next.js + Prisma monorepo. Use this guide to keep contributions consistent and fast to review.

## Project Structure & Module Organization

- Root scripts orchestrate workspaces via Turborepo (`package.json`, `turbo.json`).
- `apps/web/` holds the Next.js 15 app (app router). UI primitives live in `components/`, client utilities in `hooks/` and `lib/`, and static assets in `public/`.
- `packages/database/` contains the Prisma schema, migrations, and generated client.
- `.turbo/` and `.next/` are build caches; avoid committing them.

## Build, Test, and Development Commands

- Install once at root: `npm install`.
- Start dev (Next + watches): `npm run dev`.
- Build all apps/packages: `npm run build`.
- Lint (Next ESLint flat config): `npm run lint`.
- Bring up Postgres/pgvector: `npm run setup` (runs `docker compose up -d`).
- Prisma workflows (env read from `apps/web/.env.local`):
  - `npm run prisma:migrate:dev` (root turbo task) or `npm --prefix packages/database run prisma:migrate:dev`.
  - Regenerate client: `npm --prefix packages/database run prisma:generate`.

## Coding Style & Naming Conventions

- TypeScript-first. Components/pages in PascalCase files; hooks/utilities in camelCase.
- Prettier (`.prettierrc.js`): 2-space indent, 100-char line width, semicolons, single quotes, trailing commas (es5).
- ESLint: Next core web vitals + TypeScript; prefer typed props and avoid `any`.
- Stick to Next app-router conventions (`app/` routes, server actions). Keep shared UI in `components/` to avoid duplication.

## Testing Guidelines

- No suite is configured yet; when adding tests, use Jest + React Testing Library for UI and place specs as `*.test.tsx` near components or under `__tests__/`.
- Mock Prisma and external services; keep tests deterministic. Aim for meaningful coverage on server actions and form flows.

## Commit & Pull Request Guidelines

- Follow Conventional Commits as seen in history (`feat:`, `chore:`, `fix:`). Imperative mood, scope optional.
- PRs should state intent, link issues, and note any schema or env changes. Include screenshots/GIFs for UI changes and list manual test steps.
- If migrations are included, call out the migration name and ensure `schema.prisma` and `migrations/` are in sync.

## Security & Configuration Tips

- Copy env templates from `apps/web/.env.example` to `.env.local`; never commit secrets.
- Database URLs must match the docker-compose service; restart containers after env changes.
- Clean stale builds with `npx turbo clean` (or remove `.turbo/`) when caches misbehave.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project orientation

Plum Sales Dashboard — internal AI-augmented tool that lets a sales rep look up a Plum Insurance customer by email or mobile and see a 360° profile, then generate a tailored pitch and ask free-form questions.

The current scope is a **demo**: no auth, data is loaded from a local CSV (`data/sample.csv`) instead of Google Sheets/Metabase. Treat the data layer as the eventual seam for swapping in a live source.

Two long-form companion docs in this repo carry context CLAUDE.md deliberately doesn't duplicate:

- **`PROGRESS.md`** — point-in-time snapshot of which plan phases are done, what's running, what's blocking, and how to resume cold. Read this before assuming what state the project is in.
- **`LEARNING.md`** — pitfalls handled (CSV header chaos, ESM `.js` import suffix, dd/mm/yyyy date drift, etc.) and a template for appending real errors. Append here when something genuinely fails.

The approved implementation plan lives at `/Users/Gaurav/.claude/plans/plum-sales-dashboard-product-virtual-clock.md` and is phased 0–7. Phase identity is load-bearing in commit messages and TODOs.

## Commands

All commands run from the repo root unless otherwise stated. This is an npm workspaces monorepo (`apps/*`, `packages/*`).

```bash
npm install                              # install all workspaces (~22s)
npm run dev                              # concurrently runs api (:8787) + web (:5173)
npm run typecheck                        # chained: shared → api → web
npm run build                            # chained build of all three workspaces
npm test                                 # vitest in @plum/api
```

Targeting a single workspace:

```bash
npm run dev -w @plum/api                 # tsx watch on apps/api
npm run dev -w @plum/web                 # vite on apps/web
npm run typecheck -w @plum/web
npm run build -w @plum/web
```

Running a single test:

```bash
# by file
npx vitest run apps/api/src/data/csvLoader.test.ts
# by name pattern (anywhere in the file)
npx vitest run -w @plum/api -t "finds by email"
# watch mode while iterating
npx vitest -w @plum/api
```

The CSV path defaults to `data/sample.csv` resolved relative to the loader source. Override with `PLUM_CSV_PATH` if you need to point at a different file (e.g. in tests or to demo a different dataset).

## Architecture (the big picture)

### Three-workspace shape

- `packages/shared` (`@plum/shared`) — pure TS types only, **no runtime code**. The `UserProfile` type and its sub-shapes (`Identifiers`, `LeadEngagement`, `WellnessPerks`, `ClaimsFeedback`, `PrefillForm`) are the contract that both backend and frontend consume. The package's `main` points at TS source so the API can import it under `tsx` without a build step; the web side resolves it through Vite.
- `apps/api` (`@plum/api`) — Express + TypeScript, ESM (`"type": "module"`). Runs under `tsx watch` in dev. Exposes a small REST surface under `/api`.
- `apps/web` (`@plum/web`) — Vite + React + TypeScript + Tailwind. Vite's dev server proxies `/api/*` to `:8787` so the browser sees a single origin in dev.

### Data flow

```
CSV file → CsvDataSource (papaparse + normalization)
        → in-memory indexed maps (byEmail, byMobile, byId)
        → DataSource interface
        → Express routes (zod-validated query)
        → JSON over /api
        → Vite proxy (dev) or same-origin (prod)
        → React Query hooks → page components → UI cards
```

The `DataSource` interface in `apps/api/src/data/loader.ts` is the **seam for future data sources** (Google Sheets API, Metabase). Anything that reads user data should depend on `DataSource`, not on `CsvDataSource` directly. The singleton accessor lives in `apps/api/src/data/index.ts` (`getDataSource()`); routes call it at request time and let the cached instance handle re-use.

### Header normalization is non-negotiable

The user's source CSV has dirty headers (trailing spaces, random casing, parens, real typos like `Cult purcashe date`). The loader handles this with a two-stage pipeline:

1. `normalizeHeader()` lowercases and replaces non-alphanumerics with `_`.
2. `HEADER_MAP` maps each normalized key to a canonical TS field name. Both the typo'd and the corrected spellings are mapped to the same field, so a future fixed sheet works without code change.

When the schema evolves, update `HEADER_MAP` and the `CanonicalRow` interface together. Don't add ad-hoc string lookups against raw CSV headers anywhere outside this loader.

### API contract

Every route returns either:

- success: a plain JSON object specific to the route (`{ profile: … }`, `{ profiles: […] }`, `{ ok: true }`)
- failure: `{ error: { code: string, message: string } }` with an HTTP status (400/404/500)

The error shape is enforced by `errorMiddleware` in `apps/api/src/middleware/error.ts`. New routes should `next(err)` rather than catching and returning ad-hoc shapes.

Inputs are validated with `zod`. The `searchQuery` schema in `routes/users.ts` is the pattern to follow — `safeParse`, return 400 with the first issue's message on failure.

### Frontend conventions

- **shadcn-style primitives are hand-authored** under `apps/web/src/components/ui/` (Card, Button, Input, Badge, Skeleton). They were not installed via the shadcn CLI. Add new primitives the same way (cva variants, `cn()` helper, forwardRef where it makes sense). Don't introduce a competing component library.
- **Profile id is the email** by default (falls back to mobile, then `row-N`). Always `encodeURIComponent` when routing into `/u/:id` and decoding is automatic via `useParams`.
- **React Query** wraps all data fetching. The provider is in `App.tsx` with `retry: false` and `refetchOnWindowFocus: false` to keep demo behavior predictable. Default `staleTime` is 30s.
- **Formatting helpers** live in `apps/web/src/lib/format.ts` (`formatDate`, `formatINR`, `formatMobile`, `relativeTime`, `DASH`, `fallback`). Prefer these over inline date/currency logic so empty values render consistently as `—`.

### Tailwind theme

`tailwind.config.ts` exposes both shadcn-style semantic tokens (`primary`, `accent`, `muted`, `card`, etc., bound to CSS variables in `index.css`) and a literal `plum.*` palette. Use semantic tokens for component-level styling, the literal palette for brand accents (gradients, decorative chrome).

The custom `pulse-ring` keyframe + `animate-pulse-ring` utility are reserved for highlighting conversion opportunities (Phase 4 feature). Don't use them for generic loading states.

## Conventions and gotchas

These are easy to miss and break things in non-obvious ways:

- **ESM requires `.js` import suffix in TS source on the API side.** Every internal API import looks like `from "./routes/users.js"` even though the file is `.ts`. This is a Node ESM requirement that TS's `bundler` resolution permits. Without it, `tsc`-built output throws `ERR_MODULE_NOT_FOUND` at runtime.
- **`noUncheckedIndexedAccess` is on globally** (`tsconfig.base.json`). Array indexing and object dictionary access are typed `T | undefined`. The CSV coercion helpers (`trimOrNull`, `toYesNo`, `toNumber`, `toIsoDate`) accept `string | undefined` deliberately; follow that pattern when reading optional cells.
- **Both servers must be running for the web UI to work in dev.** `npm run dev` does this. If you start them separately, start the API first — the web dev server's proxy doesn't retry on connection refused.
- **CSV path resolution uses 4 hops** from `apps/api/src/data/index.ts` so the same path works under `tsx` (src) and `node` (dist). Don't shorten it or move the loader without updating both env-fallback paths.
- **Don't run shadcn's `npx shadcn add`** — it requires interactive input and would fight with the existing hand-authored primitives. Add components manually following the same pattern as `card.tsx`/`button.tsx`.
- **Vite's `/api` proxy and Express CORS are belt-and-braces.** In dev the proxy is what the browser actually uses; CORS is there as a fallback if the SPA is ever served from a different origin. Don't remove either without thinking about prod hosting.

## Plan-driven workflow

This codebase was built phase-by-phase against `/Users/Gaurav/.claude/plans/plum-sales-dashboard-product-virtual-clock.md`. When a request maps to an existing phase, prefer the file paths and patterns the plan specifies (e.g. `apps/api/src/ai/openrouter.ts` for the OpenRouter client, `apps/web/src/lib/insights.ts` for the insight rules engine). Update `PROGRESS.md` when phase status changes. Append to `LEARNING.md` when something genuinely fails.

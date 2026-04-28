# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (also runs TypeScript check)
npm run lint     # ESLint
npm run start    # Serve production build
```

There are no automated tests. To verify correctness, run `npm run build` — it catches all TypeScript errors.

## What this app is

**Nosa Acro Suite** — a live scoring and competition management system for Acrobatic Gymnastics. Multiple judges score simultaneously from their own devices; the CJP collates all scores and approves the final result; the TV scoreboard at `/tv/[compId]` shows results in real time.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- Supabase (Postgres + Auth + Realtime + Storage)
- `@supabase/ssr` for server-side auth; `database.types.ts` is the hand-maintained type file (not auto-generated — update it manually when adding columns)

## Role system

Four roles stored in `profiles.role`: `super_admin`, `admin`, `judge`, `club`. Each role has its own home page. One auth user can have multiple profiles (e.g. a judge who is also a club admin); `ProfileContext` manages which is active and stores the selection in localStorage.

Judge panel roles (stored in `section_panel_judges.role`): **CJP**, **EJ**, **AJ**, **DJ**. These are different from the auth role — a user with role `judge` can be assigned any panel role for a session.

## Judge scoring routes

Routes like `/cjp-dj-ej-aj` mean "one device is used for CJP + DJ + EJ + AJ". The naming follows which judge roles are combined on that screen. Each route uses `useJudgeSession` and passes the relevant `handleCJPSubmit` / `handleJudgeScoreSubmit` callbacks down to view components.

Dedicated single-role routes: `/cjp`, `/dj`, `/ej`, `/aj`.  
Combined routes: `/cjp-dj`, `/cjp-dj-aj`, `/cjp-dj-ej`, `/cjp-dj-ej-aj`, `/dj-ej`, `/dj-aj`, `/dj-ej-aj`, `/ej-aj`.

## Key hooks

**`useJudgeSession`** — the central hook for all scoring pages. Loads the judge's assigned session, all panel judges, the performance list with scores and results, and provides action handlers. It also saves `dj_penalty_detail` and `cjp_penalty_detail` to `routine_results` at submit time so the TV page (anonymous) can read them without accessing the auth-restricted `scores` table.

**`useDJScoring`** — manages element flag state for DJ scoring. Persists to localStorage keyed by `scoring_dj_{perfId}` and auto-resets on performance change.

**`usePenaltyStates`** — manages the 14-category CJP penalty state per performance.

## Score submission flow

1. Each judge submits via `handleJudgeScoreSubmit` → writes to `scores` table (includes `dj_flags` JSONB for DJ judges).
2. CJP submits via `handleCJPSubmit` → reads DJ flags from `scores`, then upserts to `routine_results` with `dj_penalty_detail` and `cjp_penalty_detail` stored as JSONB alongside the computed scores.
3. TV page reads only from `routine_results` (public read policy) — it never touches `scores` or `section_panel_judges` (both auth-restricted).

## TV feature

- `/tv/[compId]` — full-screen scoreboard, anonymous access, subscribes to `tv_state` via Supabase Realtime.
- Admin controls it from the **TV tab** in competition detail (iframe preview + reveal/hide button).
- `tv_state` table has one row per competition (`unique(competition_id)`). Realtime must be enabled for this table (`alter publication supabase_realtime add table public.tv_state`).
- DJ penalty reasons shown on TV come from `routine_results.dj_penalty_detail` (ElementFlags JSONB); CJP reasons from `routine_results.cjp_penalty_detail` (PenaltyState JSONB). The `activeDJPenalties` and `activePenalties` helpers in `src/lib/penaltyLabels.ts` translate these to labelled values.

## Supabase patterns

**RLS helpers** (security definer functions, callable in policies): `get_my_role()`, `get_my_club_id()`, `get_my_judge_id()`, `is_competition_admin(competition_id)`.

**Anonymous access**: `tv_state` (read), `competitions` (read), `routine_results` (read), `teams` (read), `clubs` (read). Everything else requires auth.

**Service role key**: Baked into the server bundle at build time (in `next.config.ts`) because the deployment environment doesn't inject non-`NEXT_PUBLIC_` vars at runtime. Only used in API routes, never sent to the browser.

**Migrations**: In `supabase/migrations/`. After adding a column, also update `src/lib/database.types.ts` manually (the Row/Insert/Update blocks for that table).

## Score calculation

`final_score = (e_score × 2) + a_score + dif_score − dif_penalty − cjp_penalty`

- `e_score` is the averaged EJ score (before ×2)
- `dif_score` is the DJ difficulty total
- `dif_penalty` is the DJ penalty (from element flags: TF ×0.3, SR not done ×1.0, forbidden ×1.0, landing without support ×0.5)
- `cjp_penalty` is the CJP penalty (14 categories, FIG ruleset)

## Bilingual support

All user-facing strings support `lang: 'es' | 'en'`. Each component defines a local `T = { es: {...}, en: {...} }` constant and picks `T[lang]`. The default is Spanish (`'es'`).

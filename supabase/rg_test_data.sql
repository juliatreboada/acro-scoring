-- ─────────────────────────────────────────────────────────────────────────────
-- RG FEATURE TEST DATA
-- Run in Supabase SQL Editor against your testing database.
-- Safe to re-run: DDL uses IF NOT EXISTS; data uses ON CONFLICT DO NOTHING/UPDATE.
--
-- What this creates:
--   Part 1 — Schema setup (all the DDL that the RG expansion needs)
--   Part 2 — Apparatus master data (all 6 FIG apparatus)
--   Part 3 — RG age group rules (3 Individual, 2 Group)
--   Part 4 — Club + gymnasts + 3 RG teams (1 Individual, 1 Group, 1 extra)
--   Part 5 — team_apparatus links + rg_registrations at every status
--   Part 6 — RG competition + panel + section + 2 sessions (Indiv.Aro, Group Aro+Pelota)
--   Part 7 — section_panel_judges (RJ E A DA DB) for the Individual session
--   Part 8 — Scores (E ×2, A, DA, DB) + approved result with RJ penalty
--   Part 9 — TV state pointing at that result
--
-- After running, also update src/lib/database.types.ts manually (see Part 1 comments).
--
-- TV display URL  : /tv/fe000000-0000-0000-0000-000000000040
-- Judge routes to test:
--   RJ only : /rg/rj
--   E  only : /rg/e
--   A  only : /rg/a
--   DA only : /rg/da
--   DB only : /rg/db
--   RJ+E combined: /rg/rj-e  (etc.)
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1 — SCHEMA SETUP
-- All DDL is idempotent. Run once; subsequent runs are no-ops.
-- After this runs, add the new tables/columns to database.types.ts manually.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Extend enums ─────────────────────────────────────────────────────────────

-- Judge roles for RG panels
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'RJ';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'E';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'A';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'DA';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'DB';

-- Apparatus as routine_type values (reuses the same enum the sessions table uses)
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Free';
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Hoop';
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Ball';
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Clubs';
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Ribbon';
ALTER TYPE public.routine_type ADD VALUE IF NOT EXISTS 'Rope';

-- ── Add sport_type to existing tables ────────────────────────────────────────

ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'acro';

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'acro';

ALTER TABLE public.age_group_rules
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'acro';

-- ── Add RG score columns to routine_results ───────────────────────────────────

ALTER TABLE public.routine_results
  ADD COLUMN IF NOT EXISTS da_score numeric;
ALTER TABLE public.routine_results
  ADD COLUMN IF NOT EXISTS db_score numeric;
ALTER TABLE public.routine_results
  ADD COLUMN IF NOT EXISTS rj_penalty numeric;
ALTER TABLE public.routine_results
  ADD COLUMN IF NOT EXISTS rj_penalty_detail jsonb;

-- ── Add DB judge score column to scores ───────────────────────────────────────

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS db_score numeric;

-- ── New tables ────────────────────────────────────────────────────────────────

-- apparatus: master list of the 6 FIG apparatus
CREATE TABLE IF NOT EXISTS public.apparatus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es     text NOT NULL,   -- display name in Spanish
  name_en     text NOT NULL,   -- display name in English
  routine_type text NOT NULL   -- matches the routine_type enum value used in sessions
);

-- apparatus_rules: which apparatus are valid for a given age group + year
CREATE TABLE IF NOT EXISTS public.apparatus_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_id  uuid NOT NULL REFERENCES public.age_group_rules(id) ON DELETE CASCADE,
  apparatus_id  uuid NOT NULL REFERENCES public.apparatus(id) ON DELETE CASCADE,
  year          integer NOT NULL,
  UNIQUE(age_group_id, apparatus_id, year)
);

-- team_apparatus: which apparatus a team competes with (set at team creation)
CREATE TABLE IF NOT EXISTS public.team_apparatus (
  team_id      uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  apparatus_id uuid NOT NULL REFERENCES public.apparatus(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, apparatus_id)
);

-- rg_registrations: RG registration flow (replaces competition_entries for RG)
CREATE TABLE IF NOT EXISTS public.rg_registrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id               uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  competition_id        uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  status                text NOT NULL DEFAULT 'pending',
  -- pending → inscription_approved → payment_pending → registered
  payment_document_url  text,
  notes                 text,
  approved_by           uuid REFERENCES public.admins(id),
  approved_at           timestamptz,
  payment_approved_by   uuid REFERENCES public.admins(id),
  payment_approved_at   timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, competition_id)
);

-- RLS: permissive for testing — tighten in production
ALTER TABLE public.apparatus         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apparatus_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_apparatus    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rg_registrations  ENABLE ROW LEVEL SECURITY;

-- Allow public read so the app can load data without auth in testing
CREATE POLICY IF NOT EXISTS "apparatus: public read"
  ON public.apparatus FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "apparatus_rules: public read"
  ON public.apparatus_rules FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "team_apparatus: public read"
  ON public.team_apparatus FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "rg_registrations: public read"
  ON public.rg_registrations FOR SELECT USING (true);

-- Allow all for authenticated users in testing
CREATE POLICY IF NOT EXISTS "apparatus: auth all"
  ON public.apparatus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "apparatus_rules: auth all"
  ON public.apparatus_rules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "team_apparatus: auth all"
  ON public.team_apparatus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "rg_registrations: auth all"
  ON public.rg_registrations FOR ALL USING (auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2 — APPARATUS MASTER DATA
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.apparatus (id, name_es, name_en, routine_type) values
  ('fe000000-0000-0000-0000-000000000011', 'Manos Libres', 'Free',   'Free'  ),
  ('fe000000-0000-0000-0000-000000000012', 'Aro',          'Hoop',   'Hoop'  ),
  ('fe000000-0000-0000-0000-000000000013', 'Pelota',       'Ball',   'Ball'  ),
  ('fe000000-0000-0000-0000-000000000014', 'Mazas',        'Clubs',  'Clubs' ),
  ('fe000000-0000-0000-0000-000000000015', 'Cinta',        'Ribbon', 'Ribbon'),
  ('fe000000-0000-0000-0000-000000000016', 'Cuerda',       'Rope',   'Rope'  )
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3 — RG AGE GROUP RULES
-- ruleset = 'Individual' | 'Group'  (how the app distinguishes them)
-- sport_type = 'rg'                 (filters these out of Acro flows)
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.age_group_rules (id, age_group, ruleset, sport_type, min_age, max_age, sort_order, routine_count) values
  -- Individual categories
  ('fe000000-0000-0000-0000-000000000001', 'Alevín RG',     'Individual', 'rg',  8, 10, 20, 2),
  ('fe000000-0000-0000-0000-000000000002', 'Infantil RG',   'Individual', 'rg', 11, 12, 21, 2),
  ('fe000000-0000-0000-0000-000000000003', 'Juvenil RG',    'Individual', 'rg', 13, 14, 22, 2),
  -- Group categories
  ('fe000000-0000-0000-0000-000000000004', 'Juvenil RG Grupo', 'Group',   'rg', 13, 17, 30, 2),
  ('fe000000-0000-0000-0000-000000000005', 'Junior RG Grupo',  'Group',   'rg', 14, 18, 31, 2)
on conflict (id) do nothing;

-- Apparatus rules for 2026 (which apparatus each age group can compete with)
insert into public.apparatus_rules (age_group_id, apparatus_id, year) values
  -- Alevín Individual: Aro + Pelota
  ('fe000000-0000-0000-0000-000000000001', 'fe000000-0000-0000-0000-000000000012', 2026),
  ('fe000000-0000-0000-0000-000000000001', 'fe000000-0000-0000-0000-000000000013', 2026),
  -- Infantil Individual: Aro + Cinta
  ('fe000000-0000-0000-0000-000000000002', 'fe000000-0000-0000-0000-000000000012', 2026),
  ('fe000000-0000-0000-0000-000000000002', 'fe000000-0000-0000-0000-000000000015', 2026),
  -- Juvenil Individual: Aro + Cinta + Mazas
  ('fe000000-0000-0000-0000-000000000003', 'fe000000-0000-0000-0000-000000000012', 2026),
  ('fe000000-0000-0000-0000-000000000003', 'fe000000-0000-0000-0000-000000000015', 2026),
  ('fe000000-0000-0000-0000-000000000003', 'fe000000-0000-0000-0000-000000000014', 2026),
  -- Juvenil Grupo: Aro + Pelota (Mixed pairs apparatus)
  ('fe000000-0000-0000-0000-000000000004', 'fe000000-0000-0000-0000-000000000012', 2026),
  ('fe000000-0000-0000-0000-000000000004', 'fe000000-0000-0000-0000-000000000013', 2026),
  -- Junior Grupo: Aro + Pelota + Mazas
  ('fe000000-0000-0000-0000-000000000005', 'fe000000-0000-0000-0000-000000000012', 2026),
  ('fe000000-0000-0000-0000-000000000005', 'fe000000-0000-0000-0000-000000000013', 2026),
  ('fe000000-0000-0000-0000-000000000005', 'fe000000-0000-0000-0000-000000000014', 2026)
on conflict (age_group_id, apparatus_id, year) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4 — CLUB + GYMNASTS + TEAMS
-- Reuses the club from tv_test_data.sql (fd000000-...002).
-- Creates separate gymnasts and teams for RG.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Club (reuse existing or insert if not present)
insert into public.clubs (id, club_name, contact_name, phone)
values ('fd000000-0000-0000-0000-000000000002', 'Club Acro Test', 'Coordinador Test', '+34 600 000 001')
on conflict (id) do nothing;

-- Gymnasts
insert into public.gymnasts (id, club_id, first_name, last_name_1, last_name_2, date_of_birth) values
  ('fe000000-0000-0000-0000-000000000020', 'fd000000-0000-0000-0000-000000000002', 'Lucía',   'Pérez',    'García',   '2013-03-10'),
  ('fe000000-0000-0000-0000-000000000021', 'fd000000-0000-0000-0000-000000000002', 'Valeria', 'Romero',   'Sanz',     '2013-07-22'),
  ('fe000000-0000-0000-0000-000000000022', 'fd000000-0000-0000-0000-000000000002', 'Alba',    'Gil',      'Navarro',  '2012-11-05'),
  ('fe000000-0000-0000-0000-000000000023', 'fd000000-0000-0000-0000-000000000002', 'Noa',     'Serrano',  'Molina',   '2013-04-18'),
  ('fe000000-0000-0000-0000-000000000024', 'fd000000-0000-0000-0000-000000000002', 'Irene',   'Castro',   'Ramos',    '2013-09-01'),
  ('fe000000-0000-0000-0000-000000000025', 'fd000000-0000-0000-0000-000000000002', 'Sara',    'Jiménez',  'Torres',   '2013-02-14')
on conflict (id) do nothing;

-- Teams
-- Team A: Individual, Infantil RG, competes with Aro + Cinta
insert into public.teams (id, club_id, category, age_group, gymnast_display, sport_type) values
  ('fe000000-0000-0000-0000-000000000030',
   'fd000000-0000-0000-0000-000000000002',
   'Individual',
   'fe000000-0000-0000-0000-000000000002',  -- Infantil RG
   'Lucía Pérez García',
   'rg')
on conflict (id) do nothing;

-- Team B: Individual, Alevín RG, competes with Aro
insert into public.teams (id, club_id, category, age_group, gymnast_display, sport_type) values
  ('fe000000-0000-0000-0000-000000000031',
   'fd000000-0000-0000-0000-000000000002',
   'Individual',
   'fe000000-0000-0000-0000-000000000001',  -- Alevín RG
   'Valeria Romero Sanz',
   'rg')
on conflict (id) do nothing;

-- Team C: Group (5 gymnasts), Juvenil RG Grupo, Aro + Pelota
insert into public.teams (id, club_id, category, age_group, gymnast_display, sport_type) values
  ('fe000000-0000-0000-0000-000000000032',
   'fd000000-0000-0000-0000-000000000002',
   'Group',
   'fe000000-0000-0000-0000-000000000004',  -- Juvenil RG Grupo
   'Gil / Serrano / Castro / Jiménez / Pérez',
   'rg')
on conflict (id) do nothing;

-- team_gymnasts
insert into public.team_gymnasts (team_id, gymnast_id) values
  ('fe000000-0000-0000-0000-000000000030', 'fe000000-0000-0000-0000-000000000020'),
  ('fe000000-0000-0000-0000-000000000031', 'fe000000-0000-0000-0000-000000000021'),
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000022'),
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000023'),
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000024'),
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000025')
on conflict do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5 — TEAM_APPARATUS + RG_REGISTRATIONS
-- Covers every registration status so you can test the admin approval flow.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Team A competes with: Aro
insert into public.team_apparatus (team_id, apparatus_id) values
  ('fe000000-0000-0000-0000-000000000030', 'fe000000-0000-0000-0000-000000000012')  -- Aro
on conflict do nothing;

-- Team B competes with: Aro + Pelota
insert into public.team_apparatus (team_id, apparatus_id) values
  ('fe000000-0000-0000-0000-000000000031', 'fe000000-0000-0000-0000-000000000012'),  -- Aro
  ('fe000000-0000-0000-0000-000000000031', 'fe000000-0000-0000-0000-000000000013')   -- Pelota
on conflict do nothing;

-- Team C (Group) competes with: Aro + Pelota
insert into public.team_apparatus (team_id, apparatus_id) values
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000012'),  -- Aro
  ('fe000000-0000-0000-0000-000000000032', 'fe000000-0000-0000-0000-000000000013')   -- Pelota
on conflict do nothing;

-- rg_registrations — one team per status level for testing the admin flow
-- Competition UUID defined in Part 6 below — use the same fe000000-...040
insert into public.rg_registrations (id, team_id, competition_id, status) values
  -- Team A: fully registered → can be scored
  ('fe000000-0000-0000-0000-000000000050',
   'fe000000-0000-0000-0000-000000000030',
   'fe000000-0000-0000-0000-000000000040',
   'registered'),
  -- Team B: payment pending → admin is waiting for payment proof
  ('fe000000-0000-0000-0000-000000000051',
   'fe000000-0000-0000-0000-000000000031',
   'fe000000-0000-0000-0000-000000000040',
   'payment_pending'),
  -- Team C (Group): inscription approved → club needs to upload payment
  ('fe000000-0000-0000-0000-000000000052',
   'fe000000-0000-0000-0000-000000000032',
   'fe000000-0000-0000-0000-000000000040',
   'inscription_approved')
on conflict (team_id, competition_id) do update set status = excluded.status;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6 — RG COMPETITION + PANEL + SECTION + SESSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.competitions (id, name, sport_type, status, location, start_date, end_date, age_groups)
values (
  'fe000000-0000-0000-0000-000000000040',
  'Test RG Championship 2026',
  'rg',
  'active',
  'Madrid, Spain',
  '2026-05-10',
  '2026-05-10',
  array[
    'fe000000-0000-0000-0000-000000000001',
    'fe000000-0000-0000-0000-000000000002',
    'fe000000-0000-0000-0000-000000000004'
  ]
)
on conflict (id) do nothing;

insert into public.panels (id, competition_id, panel_number)
values ('fe000000-0000-0000-0000-000000000060', 'fe000000-0000-0000-0000-000000000040', 1)
on conflict (id) do nothing;

insert into public.sections (id, competition_id, section_number, label)
values ('fe000000-0000-0000-0000-000000000061', 'fe000000-0000-0000-0000-000000000040', 1, 'Mañana')
on conflict (id) do nothing;

-- Session 1: Individual — Infantil RG — Aro
-- category='Individual', routine_type='Hoop'
-- Team A (registered) is the performer
insert into public.sessions
  (id, competition_id, panel_id, section_id, name, age_group, category, routine_type, order_index, status)
values (
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000040',
  'fe000000-0000-0000-0000-000000000060',
  'fe000000-0000-0000-0000-000000000061',
  'Infantil RG · Individual · Aro',
  'fe000000-0000-0000-0000-000000000002',  -- Infantil RG
  'Individual',
  'Hoop',
  1,
  'active'
)
on conflict (id) do nothing;

-- session_orders: Team A is performer #1 in this session
insert into public.session_orders (session_id, team_id, position)
values ('fe000000-0000-0000-0000-000000000070', 'fe000000-0000-0000-0000-000000000030', 1)
on conflict do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7 — JUDGES + SECTION_PANEL_JUDGES
-- Creates 5 judges (RJ, E×2, A, DA, DB) and assigns them to the session.
-- These judges have no auth user — they exist only for data structure testing.
-- To test the actual judge routes, link one of these judge records to your
-- auth user via: UPDATE judges SET user_id = auth.uid() WHERE id = '...';
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.judges (id, name, email, licence) values
  ('fe000000-0000-0000-0000-000000000081', 'Martina RJ',  'rj@test.com',  'RG-RJ-001'),
  ('fe000000-0000-0000-0000-000000000082', 'Elena E1',    'e1@test.com',  'RG-E-001'),
  ('fe000000-0000-0000-0000-000000000083', 'Sofía E2',    'e2@test.com',  'RG-E-002'),
  ('fe000000-0000-0000-0000-000000000084', 'Ana A',       'a@test.com',   'RG-A-001'),
  ('fe000000-0000-0000-0000-000000000085', 'Clara DA',    'da@test.com',  'RG-DA-001'),
  ('fe000000-0000-0000-0000-000000000086', 'Irene DB',    'db@test.com',  'RG-DB-001')
on conflict (id) do nothing;

-- Assign to the panel/section
insert into public.section_panel_judges (id, panel_id, section_id, judge_id, role, role_number) values
  ('fe000000-0000-0000-0000-000000000090',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000081', 'RJ', 1),
  ('fe000000-0000-0000-0000-000000000091',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000082', 'E', 1),
  ('fe000000-0000-0000-0000-000000000092',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000083', 'E', 2),
  ('fe000000-0000-0000-0000-000000000093',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000084', 'A', 1),
  ('fe000000-0000-0000-0000-000000000094',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000085', 'DA', 1),
  ('fe000000-0000-0000-0000-000000000095',
   'fe000000-0000-0000-0000-000000000060',
   'fe000000-0000-0000-0000-000000000061',
   'fe000000-0000-0000-0000-000000000086', 'DB', 1)
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8 — SCORES + APPROVED RESULT
--
-- Scenario: Lucía Pérez García — Individual Infantil — Aro
--
-- E judge scores (entered as deductions; stored as 10 − deduction):
--   E1 enters 1.800 deduction → stored ej_score = 8.200
--   E2 enters 2.000 deduction → stored ej_score = 8.000
--   Average E = 8.100
-- A judge: enters 7.500 directly → aj_score = 7.500
-- DA judge: enters 4.10 (difficulty A) → dj_difficulty = 4.10
-- DB judge: enters 3.90 (difficulty B) → db_score = 3.90
-- RJ penalty: coach_discipline (0.50)
--
-- final = 8.100 + 7.500 + 4.10 + 3.90 − 0.50 = 23.100
-- ═══════════════════════════════════════════════════════════════════════════════

-- E1 score
insert into public.scores
  (section_panel_judge_id, session_id, team_id, ej_score, submitted_at)
values (
  'fe000000-0000-0000-0000-000000000091',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  8.200,  -- 10 − 1.800 entered by judge
  now()
)
on conflict (section_panel_judge_id, session_id, team_id)
do update set ej_score = excluded.ej_score, updated_at = now();

-- E2 score
insert into public.scores
  (section_panel_judge_id, session_id, team_id, ej_score, submitted_at)
values (
  'fe000000-0000-0000-0000-000000000092',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  8.000,  -- 10 − 2.000
  now()
)
on conflict (section_panel_judge_id, session_id, team_id)
do update set ej_score = excluded.ej_score, updated_at = now();

-- A score
insert into public.scores
  (section_panel_judge_id, session_id, team_id, aj_score, submitted_at)
values (
  'fe000000-0000-0000-0000-000000000093',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  7.500,
  now()
)
on conflict (section_panel_judge_id, session_id, team_id)
do update set aj_score = excluded.aj_score, updated_at = now();

-- DA score (stored in dj_difficulty column)
insert into public.scores
  (section_panel_judge_id, session_id, team_id, dj_difficulty, submitted_at)
values (
  'fe000000-0000-0000-0000-000000000094',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  4.10,
  now()
)
on conflict (section_panel_judge_id, session_id, team_id)
do update set dj_difficulty = excluded.dj_difficulty, updated_at = now();

-- DB score (stored in db_score column)
insert into public.scores
  (section_panel_judge_id, session_id, team_id, db_score, submitted_at)
values (
  'fe000000-0000-0000-0000-000000000095',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  3.90,
  now()
)
on conflict (section_panel_judge_id, session_id, team_id)
do update set db_score = excluded.db_score, updated_at = now();

-- RJ submits the approved result
-- rj_penalty_detail uses the same keys as scoringRulesRG.ts RJPenaltyCategory.id
insert into public.routine_results (
  session_id, team_id,
  e_score, a_score, da_score, db_score,
  rj_penalty, rj_penalty_detail,
  dif_score, dif_penalty, cjp_penalty,
  final_score, status
) values (
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  8.100,   -- average of E1+E2
  7.500,   -- A score
  4.10,    -- DA
  3.90,    -- DB
  0.50,    -- RJ penalty total
  '{"coach_discipline": true}'::jsonb,  -- which FIG category triggered
  0, 0, 0, -- Acro fields unused in RG
  23.100,  -- final = 8.1 + 7.5 + 4.1 + 3.9 − 0.5
  'approved'
)
on conflict (session_id, team_id) do update set
  e_score             = excluded.e_score,
  a_score             = excluded.a_score,
  da_score            = excluded.da_score,
  db_score            = excluded.db_score,
  rj_penalty          = excluded.rj_penalty,
  rj_penalty_detail   = excluded.rj_penalty_detail,
  final_score         = excluded.final_score,
  status              = excluded.status,
  updated_at          = now();


-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 9 — TV STATE
-- Points the TV display at the approved result above.
-- Open /tv/fe000000-0000-0000-0000-000000000040 in a second window.
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.tv_state (competition_id, session_id, team_id, revealed)
values (
  'fe000000-0000-0000-0000-000000000040',
  'fe000000-0000-0000-0000-000000000070',
  'fe000000-0000-0000-0000-000000000030',
  false  -- start hidden; click "Reveal score" in admin TV tab to animate in
)
on conflict (competition_id) do update set
  session_id = excluded.session_id,
  team_id    = excluded.team_id,
  revealed   = excluded.revealed;


-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST STEPS
--
-- 1. Run Part 1 first (schema setup). After it completes, update
--    src/lib/database.types.ts manually — add the new tables and columns.
--
-- 2. Run Parts 2–9 to load the test data.
--
-- 3. REGISTRATION FLOW (admin side):
--    → Admin → competition "Test RG Championship 2026" → tab Inscripciones
--    → You should see 3 registrations:
--        Team A: registered     ← already done; can be scored
--        Team B: payment_pending ← admin approves payment → registered
--        Team C: inscription_approved ← admin marks inscription done → payment_pending
--
-- 4. TV DISPLAY:
--    → Open /tv/fe000000-0000-0000-0000-000000000040 in one window (no login)
--    → Open the same competition in admin → TV tab in another window
--    → The result for Lucía Pérez García (score 23.100) is queued but hidden
--    → Click "Reveal score" → TV animates: E 8.100 · A 7.500 · DA 4.10 · DB 3.90 · Pen.RJ −0.5
--    → Penalty reason shown: "Disciplina del entrenador"
--
-- 5. JUDGE SCORING ROUTES (requires a real logged-in judge account):
--    → Link your judge profile to a test judge record:
--        UPDATE public.judges SET user_id = '<your-auth-uid>'
--        WHERE id = 'fe000000-0000-0000-0000-000000000081';  -- RJ
--    → Navigate to /rg/rj — you should see the session + Team A
--    → Repeat for E (/rg/e), A (/rg/a), DA (/rg/da), DB (/rg/db)
--
-- 6. VERIFY THE FORMULA:
--    SELECT e_score, a_score, da_score, db_score, rj_penalty, final_score
--    FROM routine_results
--    WHERE session_id = 'fe000000-0000-0000-0000-000000000070'
--      AND team_id    = 'fe000000-0000-0000-0000-000000000030';
--    -- Expected: 8.1 + 7.5 + 4.1 + 3.9 − 0.5 = 23.100
-- ═══════════════════════════════════════════════════════════════════════════════

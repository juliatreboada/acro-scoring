-- ─────────────────────────────────────────────────────────────────────────────
-- TV FEATURE TEST DATA
--
-- Run AFTER migration 20260427000000_tv_feature.sql.
-- Safe to re-run: uses ON CONFLICT DO NOTHING / DO UPDATE on primary keys.
--
-- Creates:
--   • 1 age group rule  (Junior FIG)
--   • 1 club            (Club Acro Test)
--   • 4 teams
--   • 1 competition     (status active)
--   • 1 panel + 1 section + 1 session
--   • 4 competition_entries with dorsals
--   • 4 approved routine_results (one has CJP penalty detail)
--
-- TV URL to open: /tv/fd000000-0000-0000-0000-000000000010
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── age group rule ───────────────────────────────────────────────────────────

insert into public.age_group_rules (id, age_group, ruleset, min_age, max_age, sort_order, routine_count)
values ('fd000000-0000-0000-0000-000000000001', 'Junior FIG', 'FIG', 12, 19, 10, 3)
on conflict (id) do nothing;

-- ─── club ─────────────────────────────────────────────────────────────────────

insert into public.clubs (id, club_name, contact_name, phone)
values ('fd000000-0000-0000-0000-000000000002', 'Club Acro Test', 'Coordinador Test', '+34 600 000 001')
on conflict (id) do nothing;

-- ─── teams ────────────────────────────────────────────────────────────────────

insert into public.teams (id, club_id, category, age_group, gymnast_display)
values
  ('fd000000-0000-0000-0000-000000000003', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Fernández / Ruiz'),
  ('fd000000-0000-0000-0000-000000000004', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'García / López'),
  ('fd000000-0000-0000-0000-000000000005', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Martínez / Sánchez'),
  ('fd000000-0000-0000-0000-000000000006', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Torres / Blanco')
on conflict (id) do nothing;

-- ─── competition (no panel_count — that's app-level only) ─────────────────────

insert into public.competitions (id, name, status, location, start_date, end_date, age_groups)
values (
  'fd000000-0000-0000-0000-000000000010',
  'Test Championship 2026 (TV)',
  'active',
  'Madrid, Spain',
  '2026-04-27',
  '2026-04-27',
  array['fd000000-0000-0000-0000-000000000001']
)
on conflict (id) do nothing;

-- ─── panel ────────────────────────────────────────────────────────────────────

insert into public.panels (id, competition_id, panel_number)
values ('fd000000-0000-0000-0000-000000000011', 'fd000000-0000-0000-0000-000000000010', 1)
on conflict (id) do nothing;

-- ─── section ──────────────────────────────────────────────────────────────────

insert into public.sections (id, competition_id, section_number, label)
values ('fd000000-0000-0000-0000-000000000012', 'fd000000-0000-0000-0000-000000000010', 1, 'Morning')
on conflict (id) do nothing;

-- ─── session ──────────────────────────────────────────────────────────────────

insert into public.sessions (id, competition_id, panel_id, section_id, name, age_group, category, routine_type, order_index, status)
values (
  'fd000000-0000-0000-0000-000000000013',
  'fd000000-0000-0000-0000-000000000010',
  'fd000000-0000-0000-0000-000000000011',
  'fd000000-0000-0000-0000-000000000012',
  'Junior FIG · Women''s Pair · Balance',
  'fd000000-0000-0000-0000-000000000001',
  'Women''s Pair',
  'Balance',
  1,
  'active'
)
on conflict (id) do nothing;

-- ─── competition entries (fixed UUIDs so ON CONFLICT id works) ────────────────

insert into public.competition_entries (id, competition_id, team_id, dorsal, dropped_out)
values
  ('fd000000-0000-0000-0000-000000000020', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000003', 1, false),
  ('fd000000-0000-0000-0000-000000000021', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000004', 2, false),
  ('fd000000-0000-0000-0000-000000000022', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000005', 3, false),
  ('fd000000-0000-0000-0000-000000000023', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000006', 4, false)
on conflict (id) do nothing;

-- ─── approved routine results ─────────────────────────────────────────────────
-- final = (e_score × 2) + a_score + dif_score − dif_penalty − cjp_penalty

-- #1 Fernández / Ruiz — clean, top score → rank 1
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000003',
  8.150, 7.800, 3.20, 0.0, 0.0, null, 27.300, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score = excluded.e_score, a_score = excluded.a_score,
  dif_score = excluded.dif_score, dif_penalty = excluded.dif_penalty,
  cjp_penalty = excluded.cjp_penalty, cjp_penalty_detail = excluded.cjp_penalty_detail,
  final_score = excluded.final_score, status = excluded.status, updated_at = now();

-- #2 García / López — rank 2
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000004',
  7.920, 7.600, 3.10, 0.0, 0.0, null, 26.540, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score = excluded.e_score, a_score = excluded.a_score,
  dif_score = excluded.dif_score, dif_penalty = excluded.dif_penalty,
  cjp_penalty = excluded.cjp_penalty, cjp_penalty_detail = excluded.cjp_penalty_detail,
  final_score = excluded.final_score, status = excluded.status, updated_at = now();

-- #3 Martínez / Sánchez — DJ penalty (fall outside boundary)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000005',
  7.600, 7.200, 2.90, 0.5, 0.0, null, 25.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score = excluded.e_score, a_score = excluded.a_score,
  dif_score = excluded.dif_score, dif_penalty = excluded.dif_penalty,
  cjp_penalty = excluded.cjp_penalty, cjp_penalty_detail = excluded.cjp_penalty_detail,
  final_score = excluded.final_score, status = excluded.status, updated_at = now();

-- #4 Torres / Blanco — CJP penalty with full breakdown:
--   p5Count=2 → "Stepping over boundary" ×2 (2 × 0.1 = 0.2)
--   p8=true   → "Advertising rules" (0.3)
--   total CJP penalty = 0.5
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000006',
  7.400, 6.900, 2.80, 0.0, 0.5,
  '{"p1Seconds":0,"p2Value":0,"p3":false,"p4":false,"p5Count":2,"p6Count":0,"p7":false,"p8":true,"p9Count":0,"p10":false,"p11":false,"p12":false,"p13":false,"p14Count":0}'::jsonb,
  24.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score = excluded.e_score, a_score = excluded.a_score,
  dif_score = excluded.dif_score, dif_penalty = excluded.dif_penalty,
  cjp_penalty = excluded.cjp_penalty, cjp_penalty_detail = excluded.cjp_penalty_detail,
  final_score = excluded.final_score, status = excluded.status, updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST STEPS
-- 1. Run migration 20260427000000_tv_feature.sql
-- 2. Run this file
-- 3. Admin → competition "Test Championship 2026 (TV)" → TV tab
-- 4. Open /tv/fd000000-0000-0000-0000-000000000010 in a second window
-- 5. Queue a result → score hidden on TV
-- 6. Click "Reveal score" → scores animate in
-- 7. Queue "Torres / Blanco" to see the CJP penalty reason breakdown
-- ─────────────────────────────────────────────────────────────────────────────

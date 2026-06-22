-- ─────────────────────────────────────────────────────────────────────────────
-- TV FEATURE TEST DATA  (Score view + Ranking view)
--
-- Safe to re-run: uses ON CONFLICT DO NOTHING / DO UPDATE on primary keys.
--
-- What this creates:
--   • 1 age group rule  (Junior FIG)
--   • 3 clubs           (Acro Test · Norte · Sur)
--   • 9 teams           (5 Women's Pair · 4 Mixed Pair, spread across clubs)
--   • 1 competition     (status active)
--   • 1 panel + 1 section
--   • 4 sessions:
--       013 — Junior FIG · Women's Pair · Balance
--       050 — Junior FIG · Women's Pair · Dynamic
--       051 — Junior FIG · Mixed Pair   · Balance
--       052 — Junior FIG · Mixed Pair   · Dynamic
--   • 9 competition_entries with dorsals
--   • 13 approved routine_results (with penalty detail JSONBs)
--   • 1 tv_state row: mode=score, ranking_config pre-populated
--
-- TV URL:  /tv/fd000000-0000-0000-0000-000000000010
-- Admin:   Competition "Test Championship 2026 (TV)" → TV tab
--
-- Score view test steps:
--   1. Admin TV tab → queue any Women's Pair team → score hidden on TV
--   2. Click "Reveal" → scores animate in
--   3. Queue Martínez/Sánchez → DJ penalty (landing without support)
--   4. Queue Torres/Blanco    → CJP penalties (boundary ×2 + advertising)
--   5. Queue Vidal/Moreno     → combined DJ + CJP penalties
--
-- Ranking view test steps:
--   1. Admin TV tab → click "Cambiar a Ranking"
--   2. TV cycles through 6 slots (individual + combined)
--   3. The combined OPEN slots show R1 | R2 | Total columns
--   4. Castillo/Reyes flips from rank 3 (Balance) to rank 1 (Dynamic) in Mixed Pair
--   5. García/López beats Fernández/Ruiz in WP Dynamic but loses combined
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── age group rule ───────────────────────────────────────────────────────────

insert into public.age_group_rules (id, age_group, level, ruleset, min_age, max_age, sort_order, routine_count)
values ('fd000000-0000-0000-0000-000000000001', 'Junior FIG', 'FIG', 'FIG', 12, 19, 10, 3)
on conflict (id) do nothing;


-- ─── clubs ────────────────────────────────────────────────────────────────────

insert into public.clubs (id, club_name, contact_name, phone)
values
  ('fd000000-0000-0000-0000-000000000002', 'Club Acro Test',        'Coordinador Test', '+34 600 000 001'),
  ('fd000000-0000-0000-0000-000000000030', 'Club Gimnástica Norte', 'Directora Norte',  '+34 600 000 030'),
  ('fd000000-0000-0000-0000-000000000031', 'Real Acrobacia Sur',    'Director Sur',     '+34 600 000 031')
on conflict (id) do nothing;


-- ─── teams ────────────────────────────────────────────────────────────────────
-- Women's Pair: 003-007  (clubs: Acro Test × 2 · Norte × 2 · Sur × 1)
-- Mixed Pair:   040-043  (clubs: Norte × 2 · Sur × 2)

insert into public.teams (id, club_id, category, age_group, gymnast_display)
values
  ('fd000000-0000-0000-0000-000000000003', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Fernández / Ruiz'),
  ('fd000000-0000-0000-0000-000000000004', 'fd000000-0000-0000-0000-000000000002', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'García / López'),
  ('fd000000-0000-0000-0000-000000000005', 'fd000000-0000-0000-0000-000000000030', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Martínez / Sánchez'),
  ('fd000000-0000-0000-0000-000000000006', 'fd000000-0000-0000-0000-000000000030', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Torres / Blanco'),
  ('fd000000-0000-0000-0000-000000000007', 'fd000000-0000-0000-0000-000000000031', 'Women''s Pair', 'fd000000-0000-0000-0000-000000000001', 'Vidal / Moreno'),
  ('fd000000-0000-0000-0000-000000000040', 'fd000000-0000-0000-0000-000000000030', 'Mixed Pair',   'fd000000-0000-0000-0000-000000000001', 'Alonso / Díaz'),
  ('fd000000-0000-0000-0000-000000000041', 'fd000000-0000-0000-0000-000000000030', 'Mixed Pair',   'fd000000-0000-0000-0000-000000000001', 'Parra / Vera'),
  ('fd000000-0000-0000-0000-000000000042', 'fd000000-0000-0000-0000-000000000031', 'Mixed Pair',   'fd000000-0000-0000-0000-000000000001', 'Castillo / Reyes'),
  ('fd000000-0000-0000-0000-000000000043', 'fd000000-0000-0000-0000-000000000031', 'Mixed Pair',   'fd000000-0000-0000-0000-000000000001', 'Lozano / Cruz')
on conflict (id) do update set club_id = excluded.club_id;


-- ─── competition ─────────────────────────────────────────────────────────────

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


-- ─── panel + section ─────────────────────────────────────────────────────────

insert into public.panels (id, competition_id, panel_number)
values ('fd000000-0000-0000-0000-000000000011', 'fd000000-0000-0000-0000-000000000010', 1)
on conflict (id) do nothing;

insert into public.sections (id, competition_id, section_number, label)
values ('fd000000-0000-0000-0000-000000000012', 'fd000000-0000-0000-0000-000000000010', 1, 'Morning')
on conflict (id) do nothing;


-- ─── sessions ────────────────────────────────────────────────────────────────

insert into public.sessions (id, competition_id, panel_id, section_id, name, age_group, category, routine_type, order_index, status)
values
  (
    'fd000000-0000-0000-0000-000000000013',
    'fd000000-0000-0000-0000-000000000010',
    'fd000000-0000-0000-0000-000000000011',
    'fd000000-0000-0000-0000-000000000012',
    'Junior FIG · Women''s Pair · Balance',
    'fd000000-0000-0000-0000-000000000001',
    'Women''s Pair', 'Balance', 1, 'active'
  ),
  (
    'fd000000-0000-0000-0000-000000000050',
    'fd000000-0000-0000-0000-000000000010',
    'fd000000-0000-0000-0000-000000000011',
    'fd000000-0000-0000-0000-000000000012',
    'Junior FIG · Women''s Pair · Dynamic',
    'fd000000-0000-0000-0000-000000000001',
    'Women''s Pair', 'Dynamic', 2, 'active'
  ),
  (
    'fd000000-0000-0000-0000-000000000051',
    'fd000000-0000-0000-0000-000000000010',
    'fd000000-0000-0000-0000-000000000011',
    'fd000000-0000-0000-0000-000000000012',
    'Junior FIG · Mixed Pair · Balance',
    'fd000000-0000-0000-0000-000000000001',
    'Mixed Pair', 'Balance', 3, 'active'
  ),
  (
    'fd000000-0000-0000-0000-000000000052',
    'fd000000-0000-0000-0000-000000000010',
    'fd000000-0000-0000-0000-000000000011',
    'fd000000-0000-0000-0000-000000000012',
    'Junior FIG · Mixed Pair · Dynamic',
    'fd000000-0000-0000-0000-000000000001',
    'Mixed Pair', 'Dynamic', 4, 'active'
  )
on conflict (id) do nothing;


-- ─── competition entries ──────────────────────────────────────────────────────

insert into public.competition_entries (id, competition_id, team_id, dorsal, dropped_out)
values
  ('fd000000-0000-0000-0000-000000000020', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000003', 1, false),
  ('fd000000-0000-0000-0000-000000000021', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000004', 2, false),
  ('fd000000-0000-0000-0000-000000000022', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000005', 3, false),
  ('fd000000-0000-0000-0000-000000000023', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000006', 4, false),
  ('fd000000-0000-0000-0000-000000000024', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000007', 5, false),
  ('fd000000-0000-0000-0000-000000000060', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000040', 6, false),
  ('fd000000-0000-0000-0000-000000000061', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000041', 7, false),
  ('fd000000-0000-0000-0000-000000000062', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000042', 8, false),
  ('fd000000-0000-0000-0000-000000000063', 'fd000000-0000-0000-0000-000000000010', 'fd000000-0000-0000-0000-000000000043', 9, false)
on conflict (id) do nothing;


-- ─── session starting orders ──────────────────────────────────────────────────

-- WP Balance (013)
insert into public.session_orders (session_id, team_id, position)
values
  ('fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000006', 1),
  ('fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000005', 2),
  ('fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000004', 3),
  ('fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000007', 4),
  ('fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000003', 5)
on conflict (session_id, team_id) do nothing;

-- WP Dynamic (050)
insert into public.session_orders (session_id, team_id, position)
values
  ('fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000003', 1),
  ('fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000007', 2),
  ('fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000006', 3),
  ('fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000005', 4),
  ('fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000004', 5)
on conflict (session_id, team_id) do nothing;

-- MP Balance (051)
insert into public.session_orders (session_id, team_id, position)
values
  ('fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000043', 1),
  ('fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000041', 2),
  ('fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000040', 3),
  ('fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000042', 4)
on conflict (session_id, team_id) do nothing;

-- MP Dynamic (052)
insert into public.session_orders (session_id, team_id, position)
values
  ('fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000042', 1),
  ('fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000040', 2),
  ('fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000043', 3),
  ('fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000041', 4)
on conflict (session_id, team_id) do nothing;


-- ═════════════════════════════════════════════════════════════════════════════
-- SCORE VIEW — routine_results for Women's Pair Balance (session 013)
-- final = (e_score × 2) + a_score + dif_score − dif_penalty − cjp_penalty
-- ═════════════════════════════════════════════════════════════════════════════

-- #1 Fernández / Ruiz (Club Acro Test) — clean, rank 1  →  27.300
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000003',
  8.150, 7.800, 3.200, 0.0, 0.0, 27.300, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- #2 García / López (Club Acro Test) — rank 2  →  26.540
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000004',
  7.920, 7.600, 3.100, 0.0, 0.0, 26.540, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- #3 Martínez / Sánchez (Club Norte) — DJ penalty: landing without support  →  25.000
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, dj_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000005',
  7.600, 7.200, 2.900, 0.5, 0.0,
  '{"elem_3:1":{"isDone":true,"tfCount":0,"srNotDone":false,"forbiddenElement":false,"landingWithoutSupport":true,"note":"Fall on dismount"}}'::jsonb,
  25.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  dj_penalty_detail=excluded.dj_penalty_detail,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- #4 Torres / Blanco (Club Norte) — CJP penalties: boundary ×2 + advertising  →  24.000
--    cjp_penalty_detail: p5Count=2 → 0.2 · p8=true → 0.3  (total 0.5)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000006',
  7.400, 6.900, 2.800, 0.0, 0.5,
  '{"p1Seconds":0,"p2Value":0,"p3":false,"p4":false,"p5Count":2,"p6Count":0,"p7":false,"p8":true,"p9Count":0,"p10":false,"p11":false,"p12":false,"p13":false,"p14Count":0}'::jsonb,
  24.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  cjp_penalty_detail=excluded.cjp_penalty_detail,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- #5 Vidal / Moreno (Real Acrobacia Sur) — combined DJ + CJP penalties  →  19.000
--    DJ: TF ×2 on elem_1 (0.6) · SR not done on elem_2 (1.0) · forbidden elem_4 (1.0)
--        landing without support on elem_5 (0.5)  →  dif_penalty = 3.1
--    CJP: p6Count=1 → landing outside boundary (0.5)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, cjp_penalty_detail, dj_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000013', 'fd000000-0000-0000-0000-000000000007',
  6.800, 6.500, 2.500, 3.1, 0.5,
  '{"p1Seconds":0,"p2Value":0,"p3":false,"p4":false,"p5Count":0,"p6Count":1,"p7":false,"p8":false,"p9Count":0,"p10":false,"p11":false,"p12":false,"p13":false,"p14Count":0}'::jsonb,
  '{"elem_1:1":{"isDone":true,"tfCount":2,"srNotDone":false,"forbiddenElement":false,"landingWithoutSupport":false,"note":"Incomplete rotation"},"elem_2:1":{"isDone":false,"tfCount":0,"srNotDone":true,"forbiddenElement":false,"landingWithoutSupport":false,"note":""},"elem_4:1":{"isDone":true,"tfCount":0,"srNotDone":false,"forbiddenElement":true,"landingWithoutSupport":false,"note":"Element not in tariff"},"elem_5:1":{"isDone":true,"tfCount":0,"srNotDone":false,"forbiddenElement":false,"landingWithoutSupport":true,"note":"No hand contact on landing"}}'::jsonb,
  19.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  cjp_penalty_detail=excluded.cjp_penalty_detail, dj_penalty_detail=excluded.dj_penalty_detail,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();


-- ═════════════════════════════════════════════════════════════════════════════
-- RANKING VIEW — routine_results for all ranking sessions
-- Interesting flip: García/López wins WP Dynamic but loses combined
--                   Castillo/Reyes wins MP Dynamic but loses combined
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Women's Pair Dynamic (session 050) ───────────────────────────────────────
-- Combined WP totals: Fernández/Ruiz 54.300 · García/López 54.040
--                     Martínez/Sánchez 51.200 · Torres/Blanco 49.200 · Vidal/Moreno 43.100

-- Fernández / Ruiz  →  27.000  (rank 2 in Dynamic, rank 1 combined)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000003',
  7.900, 7.600, 3.600, 0.0, 0.0, 27.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- García / López  →  27.500  (rank 1 in Dynamic, rank 2 combined)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000004',
  8.050, 7.700, 3.700, 0.0, 0.0, 27.500, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Martínez / Sánchez  →  26.200
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000005',
  7.750, 7.400, 3.300, 0.0, 0.0, 26.200, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Torres / Blanco  →  25.200
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000006',
  7.500, 7.200, 3.000, 0.0, 0.0, 25.200, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Vidal / Moreno  →  24.100
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000050', 'fd000000-0000-0000-0000-000000000007',
  7.200, 6.900, 2.800, 0.0, 0.0, 24.100, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();


-- ── Mixed Pair Balance (session 051) ─────────────────────────────────────────
-- Ranking: Alonso/Díaz 26.000 · Parra/Vera 25.200 · Castillo/Reyes 24.400 · Lozano/Cruz 23.300

-- Alonso / Díaz (Club Norte)  →  26.000
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000040',
  7.850, 7.500, 2.800, 0.0, 0.0, 26.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Parra / Vera (Club Norte)  →  25.200
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000041',
  7.650, 7.300, 2.600, 0.0, 0.0, 25.200, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Castillo / Reyes (Real Acrobacia Sur) — rank 3 in Balance, rank 1 in Dynamic  →  24.400
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000042',
  7.450, 7.100, 2.400, 0.0, 0.0, 24.400, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Lozano / Cruz (Real Acrobacia Sur) — DJ penalty (TF)  →  23.300
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, dj_penalty_detail, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000051', 'fd000000-0000-0000-0000-000000000043',
  7.250, 6.900, 2.200, 0.3, 0.0,
  '{"elem_2:1":{"isDone":true,"tfCount":1,"srNotDone":false,"forbiddenElement":false,"landingWithoutSupport":false,"note":""}}'::jsonb,
  23.300, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  dj_penalty_detail=excluded.dj_penalty_detail,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();


-- ── Mixed Pair Dynamic (session 052) ─────────────────────────────────────────
-- Castillo/Reyes leads Dynamic!
-- Combined MP totals: Alonso/Díaz 52.200 · Castillo/Reyes 51.400
--                     Parra/Vera 50.600 · Lozano/Cruz 47.900

-- Castillo / Reyes  →  27.000  (rank 1 in Dynamic, rank 2 combined)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000042',
  8.100, 7.600, 3.200, 0.0, 0.0, 27.000, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Alonso / Díaz  →  26.200  (rank 2 in Dynamic, rank 1 combined)
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000040',
  7.900, 7.400, 3.000, 0.0, 0.0, 26.200, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Parra / Vera  →  25.400
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000041',
  7.700, 7.200, 2.800, 0.0, 0.0, 25.400, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();

-- Lozano / Cruz  →  24.600
insert into public.routine_results
  (session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status)
values (
  'fd000000-0000-0000-0000-000000000052', 'fd000000-0000-0000-0000-000000000043',
  7.500, 7.000, 2.600, 0.0, 0.0, 24.600, 'approved'
)
on conflict (session_id, team_id) do update set
  e_score=excluded.e_score, a_score=excluded.a_score, dif_score=excluded.dif_score,
  dif_penalty=excluded.dif_penalty, cjp_penalty=excluded.cjp_penalty,
  final_score=excluded.final_score, status=excluded.status, updated_at=now();


-- ═════════════════════════════════════════════════════════════════════════════
-- tv_state — starts in score mode, ranking_config pre-populated
-- Switch to ranking mode from Admin → TV tab → "Cambiar a Ranking"
--
-- 6 slots:
--   1. WP Balance (individual)
--   2. WP Dynamic (individual)
--   3. OPEN Clasificatoria WP  ← combined Balance+Dynamic, shows R1|R2|Total
--   4. MP Balance (individual)
--   5. MP Dynamic (individual)
--   6. OPEN Clasificatoria MP  ← combined Balance+Dynamic, shows R1|R2|Total
-- ═════════════════════════════════════════════════════════════════════════════

insert into public.tv_state (
  competition_id, session_id, team_id, revealed,
  sponsor_reel_enabled, sponsor_playlist_index,
  mode, ranking_config
)
values (
  'fd000000-0000-0000-0000-000000000010',
  null, null, false, false, 0,
  'score',
  '{
    "duration_seconds": 8,
    "background_color": "#0f172a",
    "slots": [
      {
        "id": "slot_wp_bal",
        "label": "Junior FIG · Pareja Fem. · Balance",
        "session_ids": ["fd000000-0000-0000-0000-000000000013"],
        "enabled": true
      },
      {
        "id": "slot_wp_dyn",
        "label": "Junior FIG · Pareja Fem. · Dinámica",
        "session_ids": ["fd000000-0000-0000-0000-000000000050"],
        "enabled": true
      },
      {
        "id": "slot_wp_combined",
        "label": "OPEN Clasificatoria · Pareja Femenina",
        "session_ids": [
          "fd000000-0000-0000-0000-000000000013",
          "fd000000-0000-0000-0000-000000000050"
        ],
        "enabled": true,
        "source_slot_labels": [
          "Junior FIG · Pareja Fem. · Balance",
          "Junior FIG · Pareja Fem. · Dinámica"
        ]
      },
      {
        "id": "slot_mp_bal",
        "label": "Junior FIG · Pareja Mixta · Balance",
        "session_ids": ["fd000000-0000-0000-0000-000000000051"],
        "enabled": true
      },
      {
        "id": "slot_mp_dyn",
        "label": "Junior FIG · Pareja Mixta · Dinámica",
        "session_ids": ["fd000000-0000-0000-0000-000000000052"],
        "enabled": true
      },
      {
        "id": "slot_mp_combined",
        "label": "OPEN Clasificatoria · Pareja Mixta",
        "session_ids": [
          "fd000000-0000-0000-0000-000000000051",
          "fd000000-0000-0000-0000-000000000052"
        ],
        "enabled": true,
        "source_slot_labels": [
          "Junior FIG · Pareja Mixta · Balance",
          "Junior FIG · Pareja Mixta · Dinámica"
        ]
      }
    ]
  }'::jsonb
)
on conflict (competition_id) do update set
  mode            = excluded.mode,
  ranking_config  = excluded.ranking_config,
  updated_at      = now();

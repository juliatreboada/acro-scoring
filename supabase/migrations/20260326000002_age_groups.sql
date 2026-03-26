-- ─────────────────────────────────────────────────────────────────────────────
-- Age group rules seed data
-- Uniqueness enforced by (age_group, ruleset) — names stay clean
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.age_group_rules (age_group, ruleset, routine_count, min_age, max_age, sort_order) values
  -- FIG ───────────────────────────────────────────────────────────────────────
  ('Senior',          'FIG',  3, 15, null,  1),
  ('Junior',          'FIG',  3, 13,   19,  2),
  ('Youth',           'FIG',  3, 12,   18,  3),
  ('Pre-Youth',       'FIG',  2, 11,   16,  4),

  -- RFEG ──────────────────────────────────────────────────────────────────────
  ('Senior',          'RFEG', 3, 12, null,  5),
  ('Junior',          'RFEG', 3, 11,   19,  6),
  ('Youth',           'RFEG', 3, 10,   18,  7),
  ('Pre-Youth',       'RFEG', 2,  9,   11,  8),
  ('Cadete',          'RFEG', 1,  8,   15,  9),
  ('Infantil',        'RFEG', 1,  8,   13, 10),
  ('Alevín',          'RFEG', 1,  7,   12, 11),
  ('Senior Base',     'RFEG', 2, 12, null, 12),
  ('Junior Base',     'RFEG', 2, 10,   19, 13),
  ('Cadete Base',     'RFEG', 1,  8,   16, 14),
  ('Infantil Base',   'RFEG', 1,  8,   14, 15),
  ('Alevín Base',     'RFEG', 1,  7,   13, 16),

  -- FGX ───────────────────────────────────────────────────────────────────────
  ('Absoluto Escolar','FGX',  1,  6, null, 17),
  ('Infantil Escolar','FGX',  1,  7,   15, 18),
  ('Alevín Escolar',  'FGX',  1,  6,   13, 19),
  ('Benxamín Escolar','FGX',  1,  6,   11, 20);

-- =============================================================================
-- RG SEED DATA — for use with schema_staging.sql on a fresh database
-- Replaces the 3 original migration files (age_groups_rg, rg_apparatus_rules,
-- age_group_level) which cannot run on the new schema as-is because:
--   • age_groups_rg inserts without the required level column
--   • rg_apparatus_rules uses pre-normalised age_group names
--   • age_group_level uses hardcoded UUIDs and alters columns that already exist
-- All data here is in the final post-normalisation form.
-- =============================================================================

-- ─── RG age group rules ───────────────────────────────────────────────────────

insert into public.age_group_rules (age_group, level, ruleset, routine_count, min_age, max_age, sort_order, sport_type) values
  -- ESCOLAR Individual
  ('Iniciación',   'Escolar', 'Individual', 0,  6,  7, 30, 'rg'),
  ('Prebenjamín',  'Escolar', 'Individual', 0,  7,  8, 31, 'rg'),
  ('Benjamín',     'Escolar', 'Individual', 0,  9,  9, 32, 'rg'),
  ('Alevín',       'Escolar', 'Individual', 0, 10, 11, 33, 'rg'),
  ('Infantil',     'Escolar', 'Individual', 0, 12, 13, 34, 'rg'),
  ('Cadete',       'Escolar', 'Individual', 0, 14, 15, 35, 'rg'),
  ('Senior',       'Escolar', 'Individual', 0, 16, null, 36, 'rg'),
  -- ESCOLAR Group
  ('Iniciación',   'Escolar', 'Group', 0,  6,  7, 40, 'rg'),
  ('Prebenjamín',  'Escolar', 'Group', 0,  7,  8, 41, 'rg'),
  ('Benjamín',     'Escolar', 'Group', 0,  8,  9, 42, 'rg'),
  ('Alevín',       'Escolar', 'Group', 0,  9, 11, 43, 'rg'),
  ('Infantil',     'Escolar', 'Group', 0, 11, 13, 44, 'rg'),
  ('Cadete',       'Escolar', 'Group', 0, 13, 15, 45, 'rg'),
  ('Senior',       'Escolar', 'Group', 0, 15, null, 46, 'rg'),
  -- PROMOCIÓN Individual
  ('Prebenjamín',  'Promoción', 'Individual', 0,  7,  8, 50, 'rg'),
  ('Benjamín',     'Promoción', 'Individual', 0,  9,  9, 51, 'rg'),
  ('Alevín',       'Promoción', 'Individual', 0, 10, 11, 52, 'rg'),
  ('Infantil',     'Promoción', 'Individual', 0, 12, 13, 53, 'rg'),
  ('Cadete',       'Promoción', 'Individual', 0, 14, 15, 54, 'rg'),
  ('Juvenil',      'Promoción', 'Individual', 0, 16, null, 55, 'rg'),
  ('Máster',       'Promoción', 'Individual', 0, 19, null, 56, 'rg'),
  -- PROMOCIÓN Group
  ('Prebenjamín',  'Promoción', 'Group', 0,  6,  8, 60, 'rg'),
  ('Benjamín',     'Promoción', 'Group', 0,  8,  9, 61, 'rg'),
  ('Alevín',       'Promoción', 'Group', 0,  9, 11, 62, 'rg'),
  ('Infantil',     'Promoción', 'Group', 0, 11, 13, 63, 'rg'),
  ('Cadete',       'Promoción', 'Group', 0, 13, 15, 64, 'rg'),
  ('Juvenil',      'Promoción', 'Group', 0, 15, null, 65, 'rg'),
  ('Máster',       'Promoción', 'Group', 0, 19, null, 66, 'rg'),
  -- PREBASE Individual
  ('Prebenjamín',  'Prebase', 'Individual', 0,  8,  8, 70, 'rg'),
  ('Benjamín',     'Prebase', 'Individual', 0,  9,  9, 71, 'rg'),
  ('Alevín',       'Prebase', 'Individual', 0, 10, 11, 72, 'rg'),
  ('Infantil',     'Prebase', 'Individual', 0, 12, 13, 73, 'rg'),
  ('Cadete',       'Prebase', 'Individual', 0, 14, 15, 74, 'rg'),
  ('Juvenil',      'Prebase', 'Individual', 0, 16, null, 75, 'rg'),
  -- PREBASE Group
  ('Prebenjamín',  'Prebase', 'Group', 0,  7,  8, 80, 'rg'),
  ('Benjamín',     'Prebase', 'Group', 0,  8,  9, 81, 'rg'),
  ('Alevín',       'Prebase', 'Group', 0,  9, 11, 82, 'rg'),
  ('Infantil',     'Prebase', 'Group', 0, 11, 13, 83, 'rg'),
  ('Cadete',       'Prebase', 'Group', 0, 13, 15, 84, 'rg'),
  ('Juvenil',      'Prebase', 'Group', 0, 15, null, 85, 'rg'),
  -- BASE Individual
  ('Prebenjamín',       'Base', 'Individual', 0,  8,  8,  90, 'rg'),
  ('Benjamín',          'Base', 'Individual', 0,  9,  9,  91, 'rg'),
  ('Alevín 2016',       'Base', 'Individual', 0, 10, 10,  92, 'rg'),
  ('Alevín 2015',       'Base', 'Individual', 0, 11, 11,  93, 'rg'),
  ('Infantil 2014',     'Base', 'Individual', 0, 12, 12,  94, 'rg'),
  ('Infantil 2013',     'Base', 'Individual', 0, 13, 13,  95, 'rg'),
  ('Cadete 2012',       'Base', 'Individual', 0, 14, 14,  96, 'rg'),
  ('Cadete 2011',       'Base', 'Individual', 0, 15, 15,  97, 'rg'),
  ('Juvenil (2010-2009)', 'Base', 'Individual', 0, 16, 17,  98, 'rg'),
  ('Juvenil (2008-2007)', 'Base', 'Individual', 0, 18, 19,  99, 'rg'),
  ('Juvenil (2006+)',   'Base', 'Individual', 0, 20, null, 100, 'rg'),
  -- BASE Group
  ('Prebenjamín',  'Base', 'Group', 0,  7,  8, 115, 'rg'),
  ('Benjamín',     'Base', 'Group', 0,  8,  9, 116, 'rg'),
  ('Alevín',       'Base', 'Group', 0,  9, 11, 117, 'rg'),
  ('Infantil',     'Base', 'Group', 0, 11, 13, 118, 'rg'),
  ('Cadete',       'Base', 'Group', 0, 13, 15, 119, 'rg'),
  ('Juvenil',      'Base', 'Group', 0, 15, null, 120, 'rg'),
  -- COPA BASE Individual
  ('Prebenjamín',  'Copa Base', 'Individual', 0,  8,  8, 105, 'rg'),
  ('Benjamín',     'Copa Base', 'Individual', 0,  9,  9, 106, 'rg'),
  ('Alevín',       'Copa Base', 'Individual', 0, 10, 11, 107, 'rg'),
  ('Infantil',     'Copa Base', 'Individual', 0, 12, 13, 108, 'rg'),
  ('Cadete',       'Copa Base', 'Individual', 0, 14, 15, 109, 'rg'),
  ('Juvenil',      'Copa Base', 'Individual', 0, 16, null, 110, 'rg'),
  -- COPA BASE Group
  ('Prebenjamín',  'Copa Base', 'Group', 0,  7,  8, 125, 'rg'),
  ('Benjamín',     'Copa Base', 'Group', 0,  8,  9, 126, 'rg'),
  ('Alevín',       'Copa Base', 'Group', 0,  9, 11, 127, 'rg'),
  ('Infantil',     'Copa Base', 'Group', 0, 11, 13, 128, 'rg'),
  ('Cadete',       'Copa Base', 'Group', 0, 13, 15, 129, 'rg'),
  ('Juvenil',      'Copa Base', 'Group', 0, 15, null, 130, 'rg'),
  -- FEDERADO Individual
  ('Benjamín',     'Federado', 'Individual', 0,  8,  9, 135, 'rg'),
  ('Alevín',       'Federado', 'Individual', 0, 10, 11, 136, 'rg'),
  ('Infantil',     'Federado', 'Individual', 0, 12, 13, 137, 'rg'),
  ('Júnior',       'Federado', 'Individual', 0, 14, 15, 138, 'rg'),
  ('Sénior',       'Federado', 'Individual', 0, 16, null, 139, 'rg'),
  ('1ª Categoría', 'Federado', 'Individual', 0, 15, null, 140, 'rg'),
  ('Máster',       'Federado', 'Individual', 0, 24, null, 141, 'rg'),
  -- HONOR Individual
  ('Júnior',       'Honor', 'Individual', 0, 14, 15, 145, 'rg'),
  ('Sénior',       'Honor', 'Individual', 0, 16, null, 146, 'rg'),
  -- EQUIPOS (ruleset='Equipos', level='Federado')
  ('Benjamín',     'Federado', 'Equipos', 0,  8,  9, 150, 'rg'),
  ('Alevín',       'Federado', 'Equipos', 0,  9, 11, 151, 'rg'),
  ('Infantil',     'Federado', 'Equipos', 0, 11, 13, 142, 'rg'),
  ('Júnior',       'Federado', 'Equipos', 0, 13, 15, 143, 'rg'),
  ('Sénior',       'Federado', 'Equipos', 0, 15, null, 144, 'rg'),
  ('1ª Categoría', 'Federado', 'Equipos', 0, 14, null, 145, 'rg'),
  -- CONJUNTOS (full name kept, level='Federado', ruleset='Group')
  ('Benjamín Conjuntos',            'Federado', 'Group', 0,  8,  9, 150, 'rg'),
  ('Alevín Conjuntos',              'Federado', 'Group', 0,  9, 11, 151, 'rg'),
  ('Infantil Conjuntos',            'Federado', 'Group', 0, 11, 13, 152, 'rg'),
  ('Júnior Mixta Conjuntos',        'Federado', 'Group', 0, 13, 15, 153, 'rg'),
  ('Júnior Femenina Conjuntos',     'Federado', 'Group', 0, 13, 15, 154, 'rg'),
  ('Sénior Femenina Conjuntos',     'Federado', 'Group', 0, 15, null, 155, 'rg'),
  ('Sénior Mixta Conjuntos',        'Federado', 'Group', 0, 15, null, 156, 'rg'),
  ('1ª Categoría Femenina Conjuntos','Federado', 'Group', 0, 14, null, 157, 'rg'),
  ('1ª Categoría Mixta Conjuntos',  'Federado', 'Group', 0, 14, null, 158, 'rg')
on conflict (age_group, level, ruleset) do nothing;

-- ─── Apparatus rules ─────────────────────────────────────────────────────────
-- All lookups updated to use final (post-normalisation) age_group names and
-- include level in the WHERE clause to avoid ambiguous matches.

-- ESCOLAR INDIVIDUAL

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Iniciación'  and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='Senior'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'), true, 1 union all
select (select id from age_group_rules where age_group='Iniciación'  and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'), true, 1 union all
select (select id from age_group_rules where age_group='Senior'      and level='Escolar' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),  true, 1;

-- ESCOLAR GROUP

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Iniciación'  and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='Senior'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'), true, 1 union all
select (select id from age_group_rules where age_group='Iniciación'  and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),  true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'), true, 1 union all
select (select id from age_group_rules where age_group='Senior'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),  true, 1 union all
select (select id from age_group_rules where age_group='Senior'      and level='Escolar' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),  true, 2;

-- PROMOCIÓN INDIVIDUAL

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Promoción' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1;

-- PROMOCIÓN GROUP

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Promoción' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 2 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 2 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Promoción' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1;

-- PREBASE INDIVIDUAL

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1;

-- PREBASE GROUP

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 2 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Prebase' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 2;

-- BASE INDIVIDUAL

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'            and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín 2016'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín 2015'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil 2014'       and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil 2013'       and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete 2012'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Cadete 2011'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2010-2009)' and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2008-2007)' and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2006+)'     and level='Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'            and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín 2016'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín 2015'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil 2014'       and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil 2013'       and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete 2012'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Cadete 2011'         and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2010-2009)' and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2008-2007)' and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil (2006+)'     and level='Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1;

-- BASE GROUP

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 2 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 2;

-- COPA BASE INDIVIDUAL

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1;

-- COPA BASE GROUP

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Prebenjamín' and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 2 union all
select (select id from age_group_rules where age_group='Prebenjamín' and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'    and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'      and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'    and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Cadete'      and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Juvenil'     and level='Copa Base' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 2;

-- FEDERADO INDIVIDUAL (Benjamín–1ª Categoría + Honor)
-- Note: level='Federado' added to avoid ambiguous matches with same age_group names in other levels.
-- Honor rows use level='Honor'.

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 3 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 4 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 4 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 4 union all
-- 2027 same
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 3 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 4 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 4 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Honor'    and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 4;

-- MÁSTER (choice — all apparatus optional, club picks 1)

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   false, 1 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   false, 2 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   false, 3 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  false, 4 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), false, 5 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   false, 6 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   false, 1 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   false, 2 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   false, 3 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  false, 4 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), false, 5 union all
select (select id from age_group_rules where age_group='Máster' and level='Federado' and ruleset='Individual' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   false, 6;

-- EQUIPOS (ruleset='Equipos')

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 3 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2026, (select id from apparatus where name='Ribbon'), true, 4 union all
-- 2027 same
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Benjamín'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Alevín'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 3 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Rope'),   true, 1 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil'     and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Júnior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior'       and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 3 union all
select (select id from age_group_rules where age_group='1ª Categoría' and level='Federado' and ruleset='Equipos' and sport_type='rg'), 2027, (select id from apparatus where name='Ribbon'), true, 4;

-- CONJUNTOS

insert into public.apparatus_rules (age_group_rule_id, year, apparatus_id, is_mandatory, sort_order)
select (select id from age_group_rules where age_group='Benjamín Conjuntos'             and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín Conjuntos'               and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín Conjuntos'               and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil Conjuntos'             and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Júnior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Sénior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría Femenina Conjuntos' and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría Femenina Conjuntos' and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'), true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría Mixta Conjuntos'   and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría Mixta Conjuntos'   and level='Federado' and ruleset='Group' and sport_type='rg'), 2026, (select id from apparatus where name='Clubs'), true, 2 union all
-- 2027 same
select (select id from age_group_rules where age_group='Benjamín Conjuntos'             and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín Conjuntos'               and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Free'),   true, 1 union all
select (select id from age_group_rules where age_group='Alevín Conjuntos'               and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Infantil Conjuntos'             and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Júnior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Júnior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'),  true, 1 union all
select (select id from age_group_rules where age_group='Sénior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior Femenina Conjuntos'      and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='Sénior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Ball'),   true, 1 union all
select (select id from age_group_rules where age_group='Sénior Mixta Conjuntos'         and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),   true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría Femenina Conjuntos' and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría Femenina Conjuntos' and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'), true, 2 union all
select (select id from age_group_rules where age_group='1ª Categoría Mixta Conjuntos'   and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Hoop'),  true, 1 union all
select (select id from age_group_rules where age_group='1ª Categoría Mixta Conjuntos'   and level='Federado' and ruleset='Group' and sport_type='rg'), 2027, (select id from apparatus where name='Clubs'), true, 2;

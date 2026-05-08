-- Add `level` column to age_group_rules.
-- Separates the federation/competition level (Escolar/Base/Nacional/FIG for Acro;
-- Escolar/Promoción/.../Honor for RG) from the age group base name.
-- Also: normalises age_group to just the base name (strips level suffix),
-- unifies Xuvenil→Juvenil, recategorises Equipos rows (ruleset='Group'→'Equipos'),
-- and fixes the sort_order conflict at position 100.

BEGIN;

-- Drop the old unique constraint — it only covers (age_group, ruleset), which will
-- have duplicates once we strip level suffixes (e.g. both "Senior Base RFEG" and
-- "Senior RFEG" become "Senior RFEG" before level is split out).
-- Replaced at the end with UNIQUE(age_group, level, ruleset).
ALTER TABLE age_group_rules DROP CONSTRAINT IF EXISTS age_group_rules_age_group_ruleset_key;

ALTER TABLE age_group_rules ADD COLUMN IF NOT EXISTS level text;

-- ─── Acro ────────────────────────────────────────────────────────────────────

UPDATE age_group_rules SET level = 'FIG'
  WHERE sport_type = 'acro' AND ruleset = 'FIG';

-- RFEG rows whose name ends with ' Base' → level='Base', strip suffix
UPDATE age_group_rules
  SET level = 'Base',
      age_group = regexp_replace(age_group, ' Base$', '')
  WHERE sport_type = 'acro' AND ruleset = 'RFEG' AND age_group LIKE '% Base';

-- Remaining RFEG rows → level='Nacional'
UPDATE age_group_rules SET level = 'Nacional'
  WHERE sport_type = 'acro' AND ruleset = 'RFEG' AND level IS NULL;

-- FGX (Galician federation) → level='Escolar', strip ' Escolar' suffix
UPDATE age_group_rules
  SET level = 'Escolar',
      age_group = regexp_replace(age_group, ' Escolar$', '')
  WHERE sport_type = 'acro' AND ruleset = 'FGX';

-- ─── RG: extract level from age_group suffix ─────────────────────────────────
-- Order matters: 'Copa Base' must be processed before 'Base'.

UPDATE age_group_rules
  SET level = 'Escolar',
      age_group = regexp_replace(age_group, ' Escolar$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Escolar';

UPDATE age_group_rules
  SET level = 'Promoción',
      age_group = regexp_replace(age_group, ' Promoción$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Promoción';

UPDATE age_group_rules
  SET level = 'Prebase',
      age_group = regexp_replace(age_group, ' Prebase$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Prebase';

UPDATE age_group_rules
  SET level = 'Copa Base',
      age_group = regexp_replace(age_group, ' Copa Base$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Copa Base';

UPDATE age_group_rules
  SET level = 'Base',
      age_group = regexp_replace(age_group, ' Base$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Base';

-- The three 'Juvenil Base (year)' rows end with ')' so '% Base' doesn't match them;
-- handle explicitly.
UPDATE age_group_rules SET level = 'Base', age_group = 'Juvenil (2010-2009)'
  WHERE id = '1caa1d10-b9b6-4903-9a94-5ac91fab83dc';
UPDATE age_group_rules SET level = 'Base', age_group = 'Juvenil (2008-2007)'
  WHERE id = 'e035f8e0-59e2-44de-a26a-60faa1340235';
UPDATE age_group_rules SET level = 'Base', age_group = 'Juvenil (2006+)'
  WHERE id = 'd68ca614-9cb7-488e-bfb5-fe7146ed7070';

UPDATE age_group_rules
  SET level = 'Honor',
      age_group = regexp_replace(age_group, ' Honor$', '')
  WHERE sport_type = 'rg' AND age_group LIKE '% Honor';

-- Equipos rows: gymnast type = 'Equipos' (like Individual/Group), Federado level
UPDATE age_group_rules
  SET level   = 'Federado',
      age_group = regexp_replace(age_group, ' Equipos$', ''),
      ruleset  = 'Equipos'
  WHERE sport_type = 'rg' AND age_group LIKE '% Equipos';

-- Remaining RG rows (no level suffix) = Federado
UPDATE age_group_rules SET level = 'Federado'
  WHERE sport_type = 'rg' AND level IS NULL;

-- ─── Unify Xuvenil (Galician) → Juvenil (Spanish) ────────────────────────────

UPDATE age_group_rules SET age_group = 'Juvenil'
  WHERE sport_type = 'rg' AND age_group = 'Xuvenil';

-- ─── Enforce NOT NULL now that every row has a value ─────────────────────────

ALTER TABLE age_group_rules ALTER COLUMN level SET NOT NULL;

-- ─── Fix sort_order: resolve duplicate at 100 and renumber downstream groups ──

UPDATE age_group_rules SET sort_order = CASE id
  -- Copa Base Individual: 105–110 (was 100–105, conflicted with last Base Ind. row)
  WHEN 'aac38ba2-7ba3-4c2d-b5f0-0d0e91768351' THEN 105  -- Prebenjamín Copa Base Ind
  WHEN 'e693d74c-21a7-4904-b6e5-fa978970538a' THEN 106  -- Benjamín Copa Base Ind
  WHEN '25cfe4b7-2a6a-4170-b049-b29e0c393160' THEN 107  -- Alevín Copa Base Ind
  WHEN '9ce102bd-cd6a-4397-a502-8548da93b3a2' THEN 108  -- Infantil Copa Base Ind
  WHEN '8597e74f-88b8-41a3-8027-7839081dbe07' THEN 109  -- Cadete Copa Base Ind
  WHEN 'b43caaaf-bede-4c78-8e5f-8df9ecb3b8c8' THEN 110  -- Juvenil Copa Base Ind
  -- Base Group: 115–120 (was 110–115)
  WHEN '6c792d8e-6e84-4ea3-bf5b-0be1695f6738' THEN 115  -- Prebenjamín Base Gr
  WHEN 'd12d930e-1d0c-42a6-8677-02d6c8bcc77b' THEN 116  -- Benjamín Base Gr
  WHEN '15eec330-dae9-47c9-83ef-6ca193dfc2fd' THEN 117  -- Alevín Base Gr
  WHEN '4a164f03-bd6f-4a06-8d1d-567e718cbc07' THEN 118  -- Infantil Base Gr
  WHEN 'cf748f0b-3196-496e-ac4a-0bfe5745bdc8' THEN 119  -- Cadete Base Gr
  WHEN '08cbe10c-ce3f-4614-aef8-49422f1bbc58' THEN 120  -- Juvenil Base Gr
  -- Copa Base Group: 125–130 (was 120–125)
  WHEN 'b45fbeb3-c8a1-4282-8b98-2469efcd6844' THEN 125  -- Prebenjamín Copa Base Gr
  WHEN '118946c7-9e55-402a-a238-03b487bde940' THEN 126  -- Benjamín Copa Base Gr
  WHEN '9686f253-4dcf-4870-9ee9-be5e4eb20d16' THEN 127  -- Alevín Copa Base Gr
  WHEN '2d9e2366-82e5-448b-b371-e10299a29592' THEN 128  -- Infantil Copa Base Gr
  WHEN 'af7cc981-ea73-40e8-be16-5cefe8b58cbb' THEN 129  -- Cadete Copa Base Gr
  WHEN 'ea2aa1b9-a976-4701-bdf3-718ab7fb4559' THEN 130  -- Juvenil Copa Base Gr
  -- Federado Individual: 135–141 (was 130–135 + 138)
  WHEN 'd0da8d05-704e-4880-95a2-83d48a8e14dc' THEN 135  -- Benjamín Federado Ind
  WHEN '3dab8406-1397-4d5d-b1e0-bb746125f834' THEN 136  -- Alevín Federado Ind
  WHEN '59396a9c-312b-47f8-8591-b8819025dec7' THEN 137  -- Infantil Federado Ind
  WHEN 'b69f3aa3-df6d-4d48-bac5-d6a1ba28145c' THEN 138  -- Júnior Federado Ind
  WHEN 'a9542a88-134d-4cd7-afde-5ac2bfeb47fc' THEN 139  -- Sénior Federado Ind
  WHEN '839766d4-09f4-4ced-a581-b4fe282d0ef6' THEN 140  -- 1ª Categoría Federado Ind
  WHEN '6347e7e0-dc45-4d04-affd-7c9392835050' THEN 141  -- Máster Federado Ind
  -- Honor Individual: 145–146 (was 136–137)
  WHEN 'c871541f-eb58-4a53-a735-0f3d4f2fa2e5' THEN 145  -- Júnior Honor Ind
  WHEN 'cb14f15e-76b4-4322-86c0-fa9d9407c5ef' THEN 146  -- Sénior Honor Ind
  -- Equipos Group (Federado level): 150–151 (was 140–141)
  WHEN 'aafe9ebc-5c84-4bbc-aa4b-166a9472cf01' THEN 150  -- Benjamín Equipos
  WHEN 'fae015e9-5fec-4133-a040-621026f2de91' THEN 151  -- Alevín Equipos
  ELSE sort_order
END
WHERE id IN (
  'aac38ba2-7ba3-4c2d-b5f0-0d0e91768351',
  'e693d74c-21a7-4904-b6e5-fa978970538a',
  '25cfe4b7-2a6a-4170-b049-b29e0c393160',
  '9ce102bd-cd6a-4397-a502-8548da93b3a2',
  '8597e74f-88b8-41a3-8027-7839081dbe07',
  'b43caaaf-bede-4c78-8e5f-8df9ecb3b8c8',
  '6c792d8e-6e84-4ea3-bf5b-0be1695f6738',
  'd12d930e-1d0c-42a6-8677-02d6c8bcc77b',
  '15eec330-dae9-47c9-83ef-6ca193dfc2fd',
  '4a164f03-bd6f-4a06-8d1d-567e718cbc07',
  'cf748f0b-3196-496e-ac4a-0bfe5745bdc8',
  '08cbe10c-ce3f-4614-aef8-49422f1bbc58',
  'b45fbeb3-c8a1-4282-8b98-2469efcd6844',
  '118946c7-9e55-402a-a238-03b487bde940',
  '9686f253-4dcf-4870-9ee9-be5e4eb20d16',
  '2d9e2366-82e5-448b-b371-e10299a29592',
  'af7cc981-ea73-40e8-be16-5cefe8b58cbb',
  'ea2aa1b9-a976-4701-bdf3-718ab7fb4559',
  'd0da8d05-704e-4880-95a2-83d48a8e14dc',
  '3dab8406-1397-4d5d-b1e0-bb746125f834',
  '59396a9c-312b-47f8-8591-b8819025dec7',
  'b69f3aa3-df6d-4d48-bac5-d6a1ba28145c',
  'a9542a88-134d-4cd7-afde-5ac2bfeb47fc',
  '839766d4-09f4-4ced-a581-b4fe282d0ef6',
  '6347e7e0-dc45-4d04-affd-7c9392835050',
  'c871541f-eb58-4a53-a735-0f3d4f2fa2e5',
  'cb14f15e-76b4-4322-86c0-fa9d9407c5ef',
  'aafe9ebc-5c84-4bbc-aa4b-166a9472cf01',
  'fae015e9-5fec-4133-a040-621026f2de91'
);

-- Replace old (age_group, ruleset) unique constraint with (age_group, level, ruleset)
ALTER TABLE age_group_rules ADD CONSTRAINT age_group_rules_age_group_level_ruleset_key
  UNIQUE (age_group, level, ruleset);

COMMIT;

-- Prerequisites for the RG expansion that were applied directly to the staging
-- database without a migration file. Must run before the May 2026 migrations.

-- ── apparatus table + seed data ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.apparatus (
  id         uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text     NOT NULL UNIQUE,
  name_es    text,
  sort_order smallint NOT NULL DEFAULT 0
);

ALTER TABLE public.apparatus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apparatus: public read" ON public.apparatus;
CREATE POLICY "apparatus: public read" ON public.apparatus
  FOR SELECT USING (true);

INSERT INTO public.apparatus (name, name_es, sort_order) VALUES
  ('Free',   'Libre',  1),
  ('Rope',   'Cuerda', 2),
  ('Hoop',   'Aro',    3),
  ('Ball',   'Pelota', 4),
  ('Clubs',  'Mazas',  5),
  ('Ribbon', 'Cinta',  6)
ON CONFLICT (name) DO NOTHING;

-- ── apparatus_rules table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.apparatus_rules (
  id                uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_rule_id uuid     NOT NULL REFERENCES public.age_group_rules(id) ON DELETE CASCADE,
  year              integer  NOT NULL,
  apparatus_id      uuid     NOT NULL REFERENCES public.apparatus(id) ON DELETE CASCADE,
  is_mandatory      boolean  NOT NULL DEFAULT true,
  sort_order        smallint NOT NULL DEFAULT 0
);

ALTER TABLE public.apparatus_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apparatus_rules: public read" ON public.apparatus_rules;
CREATE POLICY "apparatus_rules: public read" ON public.apparatus_rules
  FOR SELECT USING (true);

-- ── age_group_rules.sport_type column ─────────────────────────────────────────
-- All existing rows are Acro; DEFAULT 'acro' backfills them correctly.

ALTER TABLE public.age_group_rules
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'acro';

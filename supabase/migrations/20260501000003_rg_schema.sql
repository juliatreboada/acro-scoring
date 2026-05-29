-- RG expansion: new tables, enum extensions, routine_results columns

-- ─── teams: add sport_type column ────────────────────────────────────────────

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS sport_type text NOT NULL DEFAULT 'acro';

-- ─── judge_role enum: add RG roles ───────────────────────────────────────────

ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'RJ';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'E';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'A';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'DA';
ALTER TYPE public.judge_role ADD VALUE IF NOT EXISTS 'DB';

-- ─── routine_results: add RG score columns ────────────────────────────────────

ALTER TABLE public.routine_results
  ADD COLUMN IF NOT EXISTS da_score          numeric,
  ADD COLUMN IF NOT EXISTS db_score          numeric,
  ADD COLUMN IF NOT EXISTS rj_penalty        numeric,
  ADD COLUMN IF NOT EXISTS rj_penalty_detail jsonb;

-- ─── rg_registrations ────────────────────────────────────────────────────────
-- status: pending | inscription_approved | payment_pending | registered

CREATE TABLE IF NOT EXISTS public.rg_registrations (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id              uuid        NOT NULL REFERENCES public.teams(id)        ON DELETE CASCADE,
  competition_id       uuid        NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  status               text        NOT NULL DEFAULT 'pending',
  payment_document_url text,
  notes                text,
  approved_by          uuid        REFERENCES public.profiles(id),
  approved_at          timestamptz,
  payment_approved_by  uuid        REFERENCES public.profiles(id),
  payment_approved_at  timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, competition_id)
);

ALTER TABLE public.rg_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rg_registrations: admin all" ON public.rg_registrations
  FOR ALL USING (get_my_role() IN ('super_admin', 'admin'));

CREATE POLICY "rg_registrations: club read own" ON public.rg_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = rg_registrations.team_id
        AND t.club_id = get_my_club_id()
    )
  );

CREATE POLICY "rg_registrations: club insert own" ON public.rg_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = rg_registrations.team_id
        AND t.club_id = get_my_club_id()
    )
  );

CREATE POLICY "rg_registrations: club update own" ON public.rg_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = rg_registrations.team_id
        AND t.club_id = get_my_club_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = rg_registrations.team_id
        AND t.club_id = get_my_club_id()
    )
  );

-- ─── team_apparatus ───────────────────────────────────────────────────────────
-- Apparatus assigned to a team at creation time, derived from apparatus_rules.

CREATE TABLE IF NOT EXISTS public.team_apparatus (
  team_id      uuid NOT NULL REFERENCES public.teams(id)    ON DELETE CASCADE,
  apparatus_id uuid NOT NULL REFERENCES public.apparatus(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, apparatus_id)
);

ALTER TABLE public.team_apparatus ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "team_apparatus: admin all" ON public.team_apparatus
  FOR ALL USING (get_my_role() IN ('super_admin', 'admin'));

-- Clubs manage their own teams' apparatus
CREATE POLICY "team_apparatus: club own" ON public.team_apparatus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_apparatus.team_id
        AND t.club_id = get_my_club_id()
    )
  );

-- Public read (judges, TV, results pages need to know team apparatus)
CREATE POLICY "team_apparatus: public read" ON public.team_apparatus
  FOR SELECT USING (true);

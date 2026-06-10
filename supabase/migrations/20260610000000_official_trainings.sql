-- add show_official_trainings to competitions
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS show_official_trainings boolean NOT NULL DEFAULT false;

-- one slot per club per competition
CREATE TABLE public.official_trainings (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id              uuid        NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  club_id                     uuid        NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  training_date               date        NOT NULL,
  warmup_start                time        NOT NULL,
  warmup_duration_minutes     integer     NOT NULL DEFAULT 0,
  competition_duration_minutes integer    NOT NULL DEFAULT 0,
  locked                      boolean     NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, club_id)
);

-- ordered music list per training slot (duplicates allowed)
CREATE TABLE public.official_training_entries (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id  uuid        NOT NULL REFERENCES public.official_trainings(id) ON DELETE CASCADE,
  team_id      uuid        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  routine_type text        NOT NULL,
  position     integer     NOT NULL,
  played_at    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.official_trainings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_training_entries ENABLE ROW LEVEL SECURITY;

-- admin: full access on trainings
CREATE POLICY "admin_all_official_trainings" ON public.official_trainings
  FOR ALL TO authenticated
  USING  (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'));

-- admin: full access on entries (resolve competition via training row)
CREATE POLICY "admin_all_official_training_entries" ON public.official_training_entries
  FOR ALL TO authenticated
  USING (
    get_my_role() IN ('super_admin', 'admin')
    OR is_competition_admin((SELECT competition_id FROM public.official_trainings WHERE id = training_id))
  )
  WITH CHECK (
    get_my_role() IN ('super_admin', 'admin')
    OR is_competition_admin((SELECT competition_id FROM public.official_trainings WHERE id = training_id))
  );

-- club: read own training slot (always)
CREATE POLICY "club_read_own_training" ON public.official_trainings
  FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

-- club: read own entries (always, even when locked)
CREATE POLICY "club_read_own_training_entries" ON public.official_training_entries
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.official_trainings ot
    WHERE ot.id = training_id AND ot.club_id = get_my_club_id()
  ));

-- club: insert entries only when not locked
CREATE POLICY "club_insert_training_entries" ON public.official_training_entries
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.official_trainings ot
    WHERE ot.id = training_id AND ot.club_id = get_my_club_id() AND ot.locked = false
  ));

-- club: update entries only when not locked
CREATE POLICY "club_update_training_entries" ON public.official_training_entries
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.official_trainings ot
    WHERE ot.id = training_id AND ot.club_id = get_my_club_id() AND ot.locked = false
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.official_trainings ot
    WHERE ot.id = training_id AND ot.club_id = get_my_club_id() AND ot.locked = false
  ));

-- club: delete entries only when not locked
CREATE POLICY "club_delete_training_entries" ON public.official_training_entries
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.official_trainings ot
    WHERE ot.id = training_id AND ot.club_id = get_my_club_id() AND ot.locked = false
  ));

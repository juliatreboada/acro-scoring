CREATE TABLE public.competition_staff (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid        NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  photo_url     text,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.competition_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage competition staff"
  ON public.competition_staff
  FOR ALL
  USING  (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'));

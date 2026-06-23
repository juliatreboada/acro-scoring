ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS meals_locked boolean NOT NULL DEFAULT false;

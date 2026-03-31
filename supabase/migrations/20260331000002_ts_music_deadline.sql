ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS ts_music_deadline date;

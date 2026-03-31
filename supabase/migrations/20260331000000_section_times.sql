-- Add scheduling fields to sections
ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS starting_time            time,
  ADD COLUMN IF NOT EXISTS waiting_time_seconds     integer,
  ADD COLUMN IF NOT EXISTS warmup_duration_minutes  integer;

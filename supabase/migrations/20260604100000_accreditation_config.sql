alter table public.competitions
  add column if not exists accreditation_config jsonb;

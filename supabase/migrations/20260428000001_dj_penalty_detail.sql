-- Store the first DJ's element flags in routine_results so the TV page
-- (anonymous) can display penalty reasons without needing to read the
-- scores or section_panel_judges tables (both are auth-restricted).
alter table public.routine_results
  add column if not exists dj_penalty_detail jsonb;

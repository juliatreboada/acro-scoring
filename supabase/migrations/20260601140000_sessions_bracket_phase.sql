-- Tag advancement sessions (Quarter-Finals, Semi-Finals, Finals) with their
-- bracket phase so the Open/Combinados tab can find them without a separate
-- mapping table. The column is null for regular age_group+category sessions.
alter table public.sessions
  add column if not exists bracket_phase text;

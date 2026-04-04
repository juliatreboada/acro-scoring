-- Add detail columns to scores for audit/teaching purposes.
-- Stores element-level flags, deductions, and extra elements as JSONB alongside
-- the already-existing calculated totals (dj_difficulty, ej_score, etc.).

alter table public.scores
  add column if not exists dj_flags          jsonb,
  add column if not exists dj_extra_elements jsonb,
  add column if not exists dj_incorrect_ts   boolean,
  add column if not exists ej_deductions     jsonb,
  add column if not exists ej_extra_elements jsonb;

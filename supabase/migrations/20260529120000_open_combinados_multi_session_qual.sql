-- Simplify Open+Combinados bracket phase keys.
--
-- Old model: separate phase_key per routine type (qualification_open_balance,
-- qualification_open_dynamic, qualification_combinados_combined, combinados_semi_combined,
-- combinados_final_combined). Unique constraint was (competition_id, phase_key) → one
-- session per phase.
--
-- New model: qualification_open covers ALL OPEN sessions (Balance + Dynamic);
-- scores are summed per team across all mapped sessions. Same for qualification_combinados.
-- Unique constraint is now (competition_id, phase_key, session_id) → multiple sessions
-- per qualification phase, one per advancement phase.

-- 1. Drop old unique constraint
alter table public.open_combinados_phase_sessions
  drop constraint if exists open_combinados_phase_sessions_competition_id_phase_key_key;

-- 2. Rename old phase keys
update public.open_combinados_phase_sessions
  set phase_key = 'qualification_open'
  where phase_key in ('qualification_open_balance', 'qualification_open_dynamic');

update public.open_combinados_phase_sessions
  set phase_key = 'qualification_combinados'
  where phase_key = 'qualification_combinados_combined';

update public.open_combinados_phase_sessions
  set phase_key = 'combinados_semi'
  where phase_key = 'combinados_semi_combined';

update public.open_combinados_phase_sessions
  set phase_key = 'combinados_final'
  where phase_key = 'combinados_final_combined';

-- 3. Add new unique constraint: prevent exact duplicates but allow multiple sessions per phase_key
alter table public.open_combinados_phase_sessions
  drop constraint if exists open_combinados_phase_sessions_competition_id_phase_key_session_id_key;

alter table public.open_combinados_phase_sessions
  add constraint open_combinados_phase_sessions_competition_id_phase_key_session_id_key
  unique (competition_id, phase_key, session_id);

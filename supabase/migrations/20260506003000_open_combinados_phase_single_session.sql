-- Align OPEN knockout phases to single mixed-session mapping per phase.
-- If previous unique index includes routine_type, replace it with phase-level uniqueness.

do $$
begin
  alter table public.open_combinados_phase_sessions
    drop constraint if exists open_combinados_phase_sessions_competition_id_phase_key_routine_type_key;
exception when undefined_table then
  null;
end $$;

alter table public.open_combinados_phase_sessions
  add constraint open_combinados_phase_sessions_competition_id_phase_key_key
  unique (competition_id, phase_key);


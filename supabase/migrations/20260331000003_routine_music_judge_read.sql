-- Allow any judge assigned to a session in a competition to read
-- routine_music for that competition (needed for DJ review and live scoring views)

create policy "routine_music: judge read" on public.routine_music
  for select using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = auth.uid()
        and s.competition_id = routine_music.competition_id
    )
  );

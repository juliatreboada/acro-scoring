-- TV (anonymous) can read provisional results for the team currently revealed on the scoreboard.
-- Approved results remain readable via "results: public read approved".
create policy "results: public read tv revealed queued"
  on public.routine_results
  for select
  using (
    status = 'provisional'
    and exists (
      select 1
      from public.tv_state ts
      inner join public.sessions sess on sess.id = routine_results.session_id
      where ts.competition_id = sess.competition_id
        and ts.session_id = routine_results.session_id
        and ts.team_id = routine_results.team_id
        and ts.revealed = true
    )
  );

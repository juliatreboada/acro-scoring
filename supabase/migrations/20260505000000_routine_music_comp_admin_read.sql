-- Competition-assigned admins can read routine_music for their competition (ZIP export, parity with sessions).

create policy "routine_music: competition admin read" on public.routine_music
  for select using (public.is_competition_admin(competition_id));

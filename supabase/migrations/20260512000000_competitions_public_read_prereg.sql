-- Anonymous home (and any anon client) needs competition rows for marketing / poster
-- while registration is open, not only once active or finished.
drop policy if exists "competitions: public read" on public.competitions;
create policy "competitions: public read" on public.competitions
  for select using (status is distinct from 'draft');

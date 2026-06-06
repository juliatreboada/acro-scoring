-- Allow anonymous read of panels / sections / sessions / entries
-- when a starting order has been published (any session with order_locked = true),
-- not only when the competition status is 'active' or 'finished'.

-- panels
drop policy if exists "panels: public read" on public.panels;
create policy "panels: public read" on public.panels
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = panels.competition_id and s.order_locked = true
    )
  );

-- sections
drop policy if exists "sections: public read" on public.sections;
create policy "sections: public read" on public.sections
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = sections.competition_id and s.order_locked = true
    )
  );

-- sessions: only locked sessions are visible before the competition is active
drop policy if exists "sessions: public read" on public.sessions;
create policy "sessions: public read" on public.sessions
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or order_locked = true
  );

-- competition_entries
drop policy if exists "entries: public read" on public.competition_entries;
create policy "entries: public read" on public.competition_entries
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = competition_entries.competition_id and s.order_locked = true
    )
  );

-- Bracket sessions have order_locked = false but should be publicly readable
-- on the starting-order page just like regular locked sessions.

-- sessions: extend public read to include bracket sessions
drop policy if exists "sessions: public read" on public.sessions;
create policy "sessions: public read" on public.sessions
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or order_locked = true
    or bracket_phase is not null
  );

-- session_orders: extend public read to include bracket session orders
drop policy if exists "session_orders: public read locked" on public.session_orders;
create policy "session_orders: public read locked" on public.session_orders
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and (s.order_locked = true or s.bracket_phase is not null)
    )
  );

-- panels/sections: extend public read to include competitions with bracket sessions
drop policy if exists "panels: public read" on public.panels;
create policy "panels: public read" on public.panels
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = panels.competition_id
        and (s.order_locked = true or s.bracket_phase is not null)
    )
  );

drop policy if exists "sections: public read" on public.sections;
create policy "sections: public read" on public.sections
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = sections.competition_id
        and (s.order_locked = true or s.bracket_phase is not null)
    )
  );

-- competition_entries: same extension
drop policy if exists "entries: public read" on public.competition_entries;
create policy "entries: public read" on public.competition_entries
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
    or exists (
      select 1 from public.sessions s
      where s.competition_id = competition_entries.competition_id
        and (s.order_locked = true or s.bracket_phase is not null)
    )
  );

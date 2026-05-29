-- Fix ts_review_status and ts_elements RLS policies to use helper functions
-- instead of auth.uid() directly. The schema redesign (20260411000001) updated
-- helpers so that profiles.id is a random UUID, not auth.uid(). These two tables
-- were created just before that fix and were missed.

-- ─── ts_review_status ────────────────────────────────────────────────────────

drop policy if exists "ts_review_status: dj all"   on public.ts_review_status;
drop policy if exists "ts_review_status: club read" on public.ts_review_status;

create policy "ts_review_status: dj all" on public.ts_review_status
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = get_my_judge_id()
        and spj.role     = 'DJ'
        and s.competition_id = ts_review_status.competition_id
    )
  );

create policy "ts_review_status: club read" on public.ts_review_status
  for select using (
    exists (
      select 1 from public.teams t
      where t.id      = ts_review_status.team_id
        and t.club_id = get_my_club_id()
    )
  );

-- ─── ts_elements ─────────────────────────────────────────────────────────────

drop policy if exists "ts_elements: judge read" on public.ts_elements;
drop policy if exists "ts_elements: dj write"   on public.ts_elements;

create policy "ts_elements: judge read" on public.ts_elements
  for select using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = get_my_judge_id()
        and s.competition_id = ts_elements.competition_id
    )
  );

create policy "ts_elements: dj write" on public.ts_elements
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = get_my_judge_id()
        and spj.role = 'DJ'
        and s.competition_id = ts_elements.competition_id
    )
  );

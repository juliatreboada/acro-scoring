-- Section-specific judging rehearsal state (single example routine, no real score persistence).

create table if not exists public.section_practice_state (
  id uuid not null default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  routine_session_id uuid not null references public.sessions(id) on delete cascade,
  routine_team_id uuid not null references public.teams(id) on delete cascade,
  active boolean not null default true,
  started_by uuid null references public.judges(id) on delete set null,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id),
  unique (section_id)
);

alter table public.section_practice_state enable row level security;

drop policy if exists "section_practice_state: read assigned" on public.section_practice_state;
create policy "section_practice_state: read assigned"
  on public.section_practice_state
  for select
  to authenticated
  using (
    get_my_role() in ('super_admin', 'admin')
    or is_competition_admin(competition_id)
    or exists (
      select 1
      from public.section_panel_judges spj
      where spj.section_id = section_practice_state.section_id
        and spj.judge_id = get_my_judge_id()
    )
  );

drop policy if exists "section_practice_state: write cjp" on public.section_practice_state;
create policy "section_practice_state: write cjp"
  on public.section_practice_state
  for all
  to authenticated
  using (
    get_my_role() in ('super_admin', 'admin')
    or is_competition_admin(competition_id)
    or exists (
      select 1
      from public.section_panel_judges spj
      where spj.section_id = section_practice_state.section_id
        and spj.judge_id = get_my_judge_id()
        and spj.role = 'CJP'
    )
  )
  with check (
    get_my_role() in ('super_admin', 'admin')
    or is_competition_admin(competition_id)
    or exists (
      select 1
      from public.section_panel_judges spj
      where spj.section_id = section_practice_state.section_id
        and spj.judge_id = get_my_judge_id()
        and spj.role = 'CJP'
    )
  );

alter publication supabase_realtime add table public.section_practice_state;

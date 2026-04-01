-- TS elements entered by DJs during review, used in live scoring views

create table public.ts_elements (
  id             uuid        primary key default gen_random_uuid(),
  team_id        uuid        not null references public.teams(id) on delete cascade,
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  position       integer     not null,
  label          text        not null default '',
  element_type   text        not null,
  is_static      boolean     not null default false,
  difficulty_value numeric(5,2) not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.ts_elements enable row level security;

-- Any judge assigned to a session in the competition can read
create policy "ts_elements: judge read" on public.ts_elements
  for select using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = auth.uid()
        and s.competition_id = ts_elements.competition_id
    )
  );

-- Only DJs can insert/update/delete
create policy "ts_elements: dj write" on public.ts_elements
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = auth.uid()
        and spj.role = 'DJ'
        and s.competition_id = ts_elements.competition_id
    )
  );

create policy "ts_elements: admin read" on public.ts_elements
  for select using (get_my_role() in ('super_admin', 'admin'));

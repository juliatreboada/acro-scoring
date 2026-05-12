-- OPEN / COMBINADOS bracket format configuration (competition-specific).

alter table public.competitions
  add column if not exists open_combinados_enabled boolean not null default false;

create table if not exists public.open_combinados_bracket_config (
  competition_id uuid primary key references public.competitions(id) on delete cascade,
  combinados_semi_count integer not null default 0,
  combinados_final_count integer not null default 12,
  open_quarter_count integer not null default 0,
  open_semi_count integer not null default 12,
  open_final_count integer not null default 8,
  updated_at timestamptz not null default now()
);

create table if not exists public.open_combinados_phase_sessions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  phase_key text not null,
  group_key text not null check (group_key in ('OPEN', 'COMBINADOS')),
  routine_type public.routine_type not null,
  session_id uuid not null references public.sessions(id) on delete cascade,
  unique (competition_id, phase_key),
  unique (session_id)
);

create table if not exists public.open_combinados_open_team_choices (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  phase_key text not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  selected_routine_type public.routine_type not null,
  updated_at timestamptz not null default now(),
  unique (competition_id, phase_key, team_id)
);

alter table public.open_combinados_bracket_config enable row level security;
alter table public.open_combinados_phase_sessions enable row level security;
alter table public.open_combinados_open_team_choices enable row level security;

drop policy if exists "open_combinados_bracket_config: read" on public.open_combinados_bracket_config;
create policy "open_combinados_bracket_config: read" on public.open_combinados_bracket_config
  for select using (true);
drop policy if exists "open_combinados_bracket_config: write" on public.open_combinados_bracket_config;
create policy "open_combinados_bracket_config: write" on public.open_combinados_bracket_config
  for all using (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

drop policy if exists "open_combinados_phase_sessions: read" on public.open_combinados_phase_sessions;
create policy "open_combinados_phase_sessions: read" on public.open_combinados_phase_sessions
  for select using (true);
drop policy if exists "open_combinados_phase_sessions: write" on public.open_combinados_phase_sessions;
create policy "open_combinados_phase_sessions: write" on public.open_combinados_phase_sessions
  for all using (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

drop policy if exists "open_combinados_open_team_choices: read" on public.open_combinados_open_team_choices;
create policy "open_combinados_open_team_choices: read" on public.open_combinados_open_team_choices
  for select using (true);
drop policy if exists "open_combinados_open_team_choices: write" on public.open_combinados_open_team_choices;
create policy "open_combinados_open_team_choices: write" on public.open_combinados_open_team_choices
  for all using (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

create table if not exists public.competition_music_unlocks (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (competition_id, team_id)
);

alter table public.competition_music_unlocks enable row level security;

drop policy if exists "competition_music_unlocks: read" on public.competition_music_unlocks;
create policy "competition_music_unlocks: read" on public.competition_music_unlocks
  for select using (true);

drop policy if exists "competition_music_unlocks: write" on public.competition_music_unlocks;
create policy "competition_music_unlocks: write" on public.competition_music_unlocks
  for all using (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

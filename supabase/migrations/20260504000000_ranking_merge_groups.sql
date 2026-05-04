-- ─── ranking merge groups (optional combined leaderboard across category sessions) ─

create table public.ranking_merge_groups (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid not null references public.competitions(id) on delete cascade,
  label_es        text,
  label_en        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index ranking_merge_groups_competition_id_idx
  on public.ranking_merge_groups (competition_id);

alter table public.sessions
  add column ranking_merge_group_id uuid
    references public.ranking_merge_groups(id) on delete set null;

create index sessions_ranking_merge_group_id_idx
  on public.sessions (ranking_merge_group_id)
  where ranking_merge_group_id is not null;

create trigger trg_ranking_merge_groups_updated_at
  before update on public.ranking_merge_groups
  for each row execute function public.update_updated_at();

-- ─── RLS (match panels / sessions pattern) ─────────────────────────────────────

alter table public.ranking_merge_groups enable row level security;

create policy "ranking_merge_groups: public read" on public.ranking_merge_groups
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
  );

create policy "ranking_merge_groups: auth read" on public.ranking_merge_groups
  for select using (auth.role() = 'authenticated');

create policy "ranking_merge_groups: super_admin all" on public.ranking_merge_groups
  for all using (public.get_my_role() = 'super_admin');

create policy "ranking_merge_groups: admin write own" on public.ranking_merge_groups
  for all using (public.is_competition_admin(competition_id));

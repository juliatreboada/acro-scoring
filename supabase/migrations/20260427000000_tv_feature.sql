-- Store CJP penalty breakdown alongside the computed total so the TV view
-- can display the reasons behind any penalty deduction.
alter table public.routine_results
  add column if not exists cjp_penalty_detail jsonb;

-- One row per competition; admin controls what the scoreboard TV shows.
create table if not exists public.tv_state (
  id             uuid        not null default gen_random_uuid(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  session_id     uuid                 references public.sessions(id)     on delete set null,
  team_id        uuid                 references public.teams(id)        on delete set null,
  revealed       boolean     not null default false,
  updated_at     timestamptz not null default now(),
  primary key (id),
  unique (competition_id)
);

alter table public.tv_state enable row level security;

-- Anonymous (TV screen) can read, no login required.
create policy "tv_state: public read"
  on public.tv_state for select
  using (true);

-- Only admins can write.
create policy "tv_state: admin write"
  on public.tv_state for all
  using (get_my_role() in ('super_admin', 'admin'));

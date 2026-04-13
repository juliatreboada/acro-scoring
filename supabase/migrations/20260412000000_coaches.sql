-- ─── coaches ──────────────────────────────────────────────────────────────────
-- Club-owned list of coaches. No auth account — managed by the club user.
-- No date_of_birth (unlike gymnasts).

create table public.coaches (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.clubs(id) on delete cascade,
  full_name  text not null,
  licence    text,
  photo_url  text,
  created_at timestamptz default now()
);

-- ─── competition_coaches ───────────────────────────────────────────────────────
-- A club registers their coaches for a competition at the competition level.

create table public.competition_coaches (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  coach_id       uuid not null references public.coaches(id) on delete cascade,
  unique(competition_id, coach_id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.coaches           enable row level security;
alter table public.competition_coaches enable row level security;

-- coaches: club can manage their own; admins/super_admins can read all
create policy "club can manage own coaches"
  on public.coaches for all
  using (
    club_id in (
      select club_id from public.profiles
      where auth_id = auth.uid() and role = 'club'
    )
  );

create policy "admins can read all coaches"
  on public.coaches for select
  using (
    exists (
      select 1 from public.profiles
      where auth_id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- competition_coaches: club can manage their own coaches' registrations
create policy "club can manage own competition_coaches"
  on public.competition_coaches for all
  using (
    coach_id in (
      select c.id from public.coaches c
      join public.profiles p on p.club_id = c.club_id
      where p.auth_id = auth.uid() and p.role = 'club'
    )
  );

create policy "admins can read all competition_coaches"
  on public.competition_coaches for select
  using (
    exists (
      select 1 from public.profiles
      where auth_id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- Storage bucket for coach photos (reuse gymnasts-photos bucket pattern)
-- Note: add "coaches-photos" bucket manually in Supabase dashboard if needed,
-- or reuse the gymnasts-photos bucket with a coaches/ prefix.

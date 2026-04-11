-- Fix all helper functions and RLS policies that assumed profiles.id = auth.uid().
-- With the new schema:
--   profiles.id     = random UUID (not tied to auth user)
--   profiles.auth_id = auth.uid()  ← the correct link
--   profiles.club_id = clubs.id    ← for role='club'

-- ─── Helper functions ─────────────────────────────────────────────────────────

-- get_my_role: highest-priority role this auth user has
create or replace function public.get_my_role()
returns text language sql stable security definer
set search_path = '' as $$
  select role::text from public.profiles
  where auth_id = auth.uid()
  order by case role::text
    when 'super_admin' then 4
    when 'admin'       then 3
    when 'club'        then 2
    when 'judge'       then 1
    else 0
  end desc
  limit 1
$$;

-- get_my_club_id: returns clubs.id from the user's club profile
create or replace function public.get_my_club_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select club_id from public.profiles
  where auth_id = auth.uid() and role = 'club'
  limit 1
$$;

-- get_my_judge_id: returns profiles.id of the user's judge profile
create or replace function public.get_my_judge_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select id from public.profiles
  where auth_id = auth.uid() and role = 'judge'
  limit 1
$$;

-- is_competition_admin: checks via profiles join (admin_id = profiles.id, not auth.uid())
create or replace function public.is_competition_admin(p_competition_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.competitions c
    join public.profiles p on p.id = c.admin_id
    where c.id = p_competition_id
      and p.auth_id = auth.uid()
  )
$$;

-- ─── profiles RLS ─────────────────────────────────────────────────────────────

drop policy if exists "profiles: own row"    on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;

create policy "profiles: own row" on public.profiles
  for select using (auth_id = auth.uid());

create policy "profiles: own update" on public.profiles
  for update using (auth_id = auth.uid());

-- ─── clubs RLS ────────────────────────────────────────────────────────────────

drop policy if exists "clubs: own all" on public.clubs;

create policy "clubs: own all" on public.clubs
  for all using (id = get_my_club_id());

-- ─── admins RLS ───────────────────────────────────────────────────────────────

drop policy if exists "admins: own row"    on public.admins;
drop policy if exists "admins: own update" on public.admins;

create policy "admins: own row" on public.admins
  for select using (
    id in (
      select id from public.profiles
      where auth_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

create policy "admins: own update" on public.admins
  for update using (
    id in (
      select id from public.profiles
      where auth_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- ─── judges RLS ───────────────────────────────────────────────────────────────

drop policy if exists "judges: own update" on public.judges;

create policy "judges: own update" on public.judges
  for update using (id = get_my_judge_id());

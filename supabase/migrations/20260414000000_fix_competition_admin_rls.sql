-- After the profiles schema redesign, admin_id in competitions stores profiles.id
-- (not auth.uid()). The old policies compared admin_id = auth.uid() which always
-- fails. Fix by joining through profiles to check auth_id.

-- Fix is_competition_admin() helper (also broken in the original migration)
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

-- Fix competition read policy for admins
drop policy if exists "competitions: admin read own" on public.competitions;
create policy "competitions: admin read own" on public.competitions
  for select using (
    get_my_role() = 'admin'
    and exists (
      select 1 from public.profiles
      where id = admin_id and auth_id = auth.uid()
    )
  );

-- Fix competition update policy for admins
drop policy if exists "competitions: admin update own" on public.competitions;
create policy "competitions: admin update own" on public.competitions
  for update using (
    get_my_role() = 'admin'
    and exists (
      select 1 from public.profiles
      where id = admin_id and auth_id = auth.uid()
    )
  );

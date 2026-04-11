-- Update handle_new_user to work with the new profiles schema:
--   - profiles.id is now a standalone UUID (not tied to auth.users.id)
--   - profiles.auth_id stores the auth user ID
--   - profiles.club_id stores the FK to clubs (for role='club')
--   - clubs.id is now a standalone UUID (no longer extends profiles)
--
-- Insertion order matters due to FKs:
--   - judge/admin: INSERT profiles first (judges/admins.id FK → profiles.id)
--   - club:        INSERT clubs first (profiles.club_id FK → clubs.id)

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
  v_role       text;
  v_profile_id uuid;
  v_club_id    uuid;
begin
  v_role       := coalesce(new.raw_user_meta_data->>'role', 'judge');
  v_profile_id := gen_random_uuid();

  if v_role in ('admin', 'super_admin') then
    -- Profile first (admins.id FK → profiles.id)
    insert into public.profiles (id, auth_id, email, role)
    values (v_profile_id, new.id, new.email, v_role::public.user_role);

    insert into public.admins (id, full_name, club_name, phone)
    values (
      v_profile_id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'club_name',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

  elsif v_role = 'judge' then
    -- Profile first (judges.id FK → profiles.id)
    insert into public.profiles (id, auth_id, email, role)
    values (v_profile_id, new.id, new.email, v_role::public.user_role);

    insert into public.judges (id, full_name, licence, phone)
    values (
      v_profile_id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'licence',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

  elsif v_role = 'club' then
    -- Club entity first (profiles.club_id FK → clubs.id)
    v_club_id := gen_random_uuid();

    insert into public.clubs (id, club_name, contact_name, phone)
    values (
      v_club_id,
      coalesce(new.raw_user_meta_data->>'club_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'contact_name',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

    insert into public.profiles (id, auth_id, email, role, club_id)
    values (v_profile_id, new.id, new.email, v_role::public.user_role, v_club_id);

  end if;

  return new;
end;
$$;

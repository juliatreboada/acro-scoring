-- Remove the coalesce default that was causing every invite without metadata
-- to be treated as a 'judge'. When no role is provided, the trigger should
-- do nothing and let the API create the profile manually.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
  v_role       text;
  v_profile_id uuid;
  v_club_id    uuid;
begin
  v_role := new.raw_user_meta_data->>'role';

  -- No role in metadata → API will handle profile creation manually
  if v_role is null or v_role = '' then
    return new;
  end if;

  v_profile_id := gen_random_uuid();

  if v_role in ('admin', 'super_admin') then
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

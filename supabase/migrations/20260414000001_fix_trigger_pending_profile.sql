-- When the import API pre-creates a club + profile (with no auth_id) and then
-- invites the user, it stores the pre-created profile id in the invite metadata
-- as `pending_profile_id`. The trigger was ignoring this and creating a second
-- club + profile. Fix: if pending_profile_id is present, just update the existing
-- profile's auth_id instead of inserting new records.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
  v_role               text;
  v_profile_id         uuid;
  v_club_id            uuid;
  v_pending_profile_id uuid;
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
    -- Check if the API pre-created a profile (import flow)
    v_pending_profile_id := (new.raw_user_meta_data->>'pending_profile_id')::uuid;

    if v_pending_profile_id is not null then
      -- Profile + club already exist; just link the auth user
      update public.profiles
      set auth_id = new.id
      where id = v_pending_profile_id;

    else
      -- Normal invite flow: create a new club + profile
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

  end if;

  return new;
end;
$$;

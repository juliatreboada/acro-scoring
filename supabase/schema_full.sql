-- =============================================================================
-- ACRO SCORING — Full consolidated schema (current state)
-- Run this on a fresh Supabase project to recreate the database structure.
-- After running, copy data from the source project using pg_dump / CSV exports.
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type public.user_role as enum (
  'super_admin',
  'admin',
  'judge',
  'club'
);

create type public.competition_status as enum (
  'draft',
  'registration_open',
  'registration_closed',
  'active',
  'finished'
);

create type public.session_status as enum (
  'waiting',
  'active',
  'finished'
);

create type public.judge_role as enum ('CJP', 'EJ', 'AJ', 'DJ');

create type public.routine_type as enum ('Balance', 'Dynamic', 'Combined');

create type public.result_status as enum ('provisional', 'approved');

-- =============================================================================
-- TABLES
-- Creation order respects foreign key dependencies.
-- =============================================================================

-- ─── clubs ────────────────────────────────────────────────────────────────────
-- Standalone entity. profiles.club_id → clubs.id (not the other way around).

create table public.clubs (
  id           uuid        primary key default gen_random_uuid(),
  club_name    text        not null,
  contact_name text,
  phone        text,
  avatar_url   text
);

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per role per auth user. auth_id links back to auth.users.
-- A user may have multiple profiles (e.g. club + judge).

create table public.profiles (
  id         uuid             primary key default gen_random_uuid(),
  auth_id    uuid             references auth.users(id) on delete cascade,
  email      text,
  role       public.user_role not null,
  club_id    uuid             references public.clubs(id) on delete set null,
  created_at timestamptz      not null default now(),
  updated_at timestamptz      not null default now()
);

-- ─── admins ───────────────────────────────────────────────────────────────────

create table public.admins (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  club_name  text,
  phone      text,
  avatar_url text
);

-- ─── judges ───────────────────────────────────────────────────────────────────

create table public.judges (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  licence    text,
  phone      text,
  avatar_url text
);

-- ─── age_group_rules ──────────────────────────────────────────────────────────

create table public.age_group_rules (
  id            uuid     primary key default uuid_generate_v4(),
  age_group     text     not null,
  ruleset       text     not null,
  routine_count smallint not null default 1,
  min_age       integer  not null,
  max_age       integer,
  sort_order    smallint not null default 0,
  unique (age_group, ruleset)
);

-- ─── gymnasts ─────────────────────────────────────────────────────────────────

create table public.gymnasts (
  id            uuid        primary key default uuid_generate_v4(),
  club_id       uuid        not null references public.clubs(id) on delete cascade,
  first_name    text        not null,
  last_name_1   text        not null,
  last_name_2   text,
  date_of_birth date        not null,
  photo_url     text,
  licencia_url  text,
  created_at    timestamptz not null default now()
);

-- ─── coaches ──────────────────────────────────────────────────────────────────

create table public.coaches (
  id           uuid        primary key default gen_random_uuid(),
  club_id      uuid        not null references public.clubs(id) on delete cascade,
  full_name    text        not null,
  licence      text,
  photo_url    text,
  licencia_url text,
  created_at   timestamptz not null default now()
);

-- ─── teams ────────────────────────────────────────────────────────────────────

create table public.teams (
  id              uuid        primary key default uuid_generate_v4(),
  club_id         uuid        not null references public.clubs(id) on delete cascade,
  category        text        not null,
  age_group       text        not null,
  gymnast_display text        not null,
  photo_url       text,
  created_at      timestamptz not null default now()
);

-- ─── team_gymnasts ────────────────────────────────────────────────────────────

create table public.team_gymnasts (
  team_id    uuid not null references public.teams(id)    on delete cascade,
  gymnast_id uuid not null references public.gymnasts(id) on delete cascade,
  primary key (team_id, gymnast_id)
);

-- ─── competitions ─────────────────────────────────────────────────────────────

create table public.competitions (
  id                    uuid                      primary key default uuid_generate_v4(),
  name                  text                      not null,
  status                public.competition_status not null default 'draft',
  location              text,
  start_date            date,
  end_date              date,
  registration_deadline date,
  ts_music_deadline     date,
  age_groups            text[]                    not null default '{}',
  poster_url            text,
  admin_id              uuid                      references public.admins(id) on delete set null,
  created_by            uuid                      references public.admins(id) on delete set null,
  created_at            timestamptz               not null default now(),
  updated_at            timestamptz               not null default now()
);

-- ─── competition_coaches ──────────────────────────────────────────────────────

create table public.competition_coaches (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  coach_id       uuid not null references public.coaches(id)      on delete cascade,
  unique (competition_id, coach_id)
);

-- ─── panels ───────────────────────────────────────────────────────────────────

create table public.panels (
  id             uuid     primary key default uuid_generate_v4(),
  competition_id uuid     not null references public.competitions(id) on delete cascade,
  panel_number   smallint not null check (panel_number in (1, 2)),
  unique (competition_id, panel_number)
);

-- ─── sections ─────────────────────────────────────────────────────────────────

create table public.sections (
  id                       uuid     primary key default uuid_generate_v4(),
  competition_id           uuid     not null references public.competitions(id) on delete cascade,
  section_number           smallint not null,
  label                    text,
  starting_time            time,
  waiting_time_seconds     integer,
  warmup_duration_minutes  integer,
  timeline_order           jsonb,
  unique (competition_id, section_number)
);

-- ─── sessions ─────────────────────────────────────────────────────────────────

create table public.sessions (
  id              uuid                  primary key default uuid_generate_v4(),
  competition_id  uuid                  not null references public.competitions(id) on delete cascade,
  panel_id        uuid                  not null references public.panels(id)       on delete cascade,
  section_id      uuid                  not null references public.sections(id)     on delete cascade,
  name            text                  not null,
  age_group       text                  not null,
  category        text                  not null,
  routine_type    public.routine_type   not null,
  status          public.session_status not null default 'waiting',
  order_index     smallint              not null default 1,
  order_locked    boolean               not null default false,
  dj_method       text,                 -- 'keyboard' | 'elements'
  ej_method       text,                 -- 'keyboard' | 'elements'
  current_team_id uuid                  references public.teams(id) on delete set null
);

-- ─── section_panel_locks ──────────────────────────────────────────────────────

create table public.section_panel_locks (
  section_id uuid    not null references public.sections(id) on delete cascade,
  panel_id   uuid    not null references public.panels(id)   on delete cascade,
  locked     boolean not null default false,
  primary key (section_id, panel_id)
);

-- ─── competition_entries ──────────────────────────────────────────────────────

create table public.competition_entries (
  id             uuid        primary key default uuid_generate_v4(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  team_id        uuid        not null references public.teams(id)        on delete cascade,
  dorsal         integer,
  dropped_out    boolean     not null default false,
  registered_at  timestamptz not null default now(),
  unique (competition_id, team_id)
);

-- ─── session_orders ───────────────────────────────────────────────────────────

create table public.session_orders (
  session_id uuid     not null references public.sessions(id) on delete cascade,
  team_id    uuid     not null references public.teams(id)    on delete cascade,
  position   smallint not null,
  primary key (session_id, team_id)
);

-- ─── competition_judge_nominations ────────────────────────────────────────────

create table public.competition_judge_nominations (
  id             uuid primary key default uuid_generate_v4(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  judge_id       uuid not null references public.judges(id)       on delete cascade,
  club_id        uuid not null references public.clubs(id)        on delete cascade,
  unique (competition_id, judge_id)
);

-- ─── section_panel_judges ─────────────────────────────────────────────────────

create table public.section_panel_judges (
  id          uuid             primary key default uuid_generate_v4(),
  section_id  uuid             not null references public.sections(id) on delete cascade,
  panel_id    uuid             not null references public.panels(id)   on delete cascade,
  judge_id    uuid             references public.judges(id)            on delete set null,
  role        public.judge_role not null,
  role_number smallint          not null default 1
);

-- ─── routine_music ────────────────────────────────────────────────────────────

create table public.routine_music (
  id             uuid               primary key default uuid_generate_v4(),
  team_id        uuid               not null references public.teams(id)        on delete cascade,
  competition_id uuid               not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  music_path     text,
  ts_path        text,
  uploaded_at    timestamptz        not null default now(),
  unique (team_id, competition_id, routine_type)
);

-- ─── ts_elements ──────────────────────────────────────────────────────────────

create table public.ts_elements (
  id               uuid               primary key default gen_random_uuid(),
  team_id          uuid               not null references public.teams(id)        on delete cascade,
  competition_id   uuid               not null references public.competitions(id) on delete cascade,
  routine_type     public.routine_type not null,
  position         integer            not null,
  label            text               not null default '',
  element_type     text               not null,
  is_static        boolean            not null default false,
  difficulty_value numeric(5,2)       not null default 0,
  created_at       timestamptz        not null default now()
);

-- ─── ts_review_status ─────────────────────────────────────────────────────────

create table public.ts_review_status (
  team_id        uuid               not null references public.teams(id)        on delete cascade,
  competition_id uuid               not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  status         text               not null default 'pending',
  dj1_id         uuid               references public.judges(id),
  dj1_decision   text,
  dj1_comment    text,
  dj1_at         timestamptz,
  dj2_id         uuid               references public.judges(id),
  dj2_decision   text,
  dj2_comment    text,
  dj2_at         timestamptz,
  final_comment  text,
  notified_at    timestamptz,
  primary key (team_id, competition_id, routine_type)
);

-- ─── scores ───────────────────────────────────────────────────────────────────

create table public.scores (
  id                     uuid        primary key default uuid_generate_v4(),
  session_id             uuid        not null references public.sessions(id)             on delete cascade,
  team_id                uuid        not null references public.teams(id)                on delete cascade,
  section_panel_judge_id uuid        not null references public.section_panel_judges(id) on delete cascade,
  ej_score               numeric(4,1),
  aj_score               numeric(4,2),
  dj_difficulty          numeric(5,2),
  dj_penalty             numeric(4,1),
  cjp_penalty            numeric(4,1),
  dj_flags               jsonb,
  dj_extra_elements      jsonb,
  dj_incorrect_ts        boolean,
  ej_deductions          jsonb,
  ej_extra_elements      jsonb,
  submitted_at           timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (session_id, team_id, section_panel_judge_id)
);

-- ─── routine_results ──────────────────────────────────────────────────────────

create table public.routine_results (
  id          uuid                primary key default uuid_generate_v4(),
  session_id  uuid                not null references public.sessions(id) on delete cascade,
  team_id     uuid                not null references public.teams(id)    on delete cascade,
  e_score     numeric(5,3),
  a_score     numeric(5,3),
  dif_score   numeric(5,2),
  dif_penalty numeric(4,1),
  cjp_penalty numeric(4,1),
  final_score numeric(6,3),
  status      public.result_status not null default 'provisional',
  approved_by uuid                references public.judges(id) on delete set null,
  approved_at timestamptz,
  created_at  timestamptz         not null default now(),
  updated_at  timestamptz         not null default now(),
  unique (session_id, team_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index on public.profiles (auth_id);
create index on public.profiles (role);
create index on public.competitions (status);
create index on public.competitions (admin_id);
create index on public.panels (competition_id);
create index on public.sections (competition_id);
create index on public.sessions (competition_id);
create index on public.sessions (panel_id);
create index on public.sessions (section_id);
create index on public.sessions (status);
create index on public.section_panel_judges (judge_id);
create index on public.section_panel_judges (section_id, panel_id);
create index on public.competition_judge_nominations (competition_id);
create index on public.competition_judge_nominations (judge_id);
create index on public.competition_entries (competition_id);
create index on public.competition_entries (team_id);
create index on public.session_orders (session_id);
create index on public.scores (session_id, team_id);
create index on public.scores (section_panel_judge_id);
create index on public.routine_results (session_id);
create index on public.routine_results (status);
create index on public.gymnasts (club_id);
create index on public.coaches (club_id);
create index on public.teams (club_id);
create index on public.routine_music (team_id, competition_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- ─── updated_at ───────────────────────────────────────────────────────────────

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger trg_competitions_updated_at
  before update on public.competitions
  for each row execute function public.update_updated_at();

create trigger trg_scores_updated_at
  before update on public.scores
  for each row execute function public.update_updated_at();

create trigger trg_routine_results_updated_at
  before update on public.routine_results
  for each row execute function public.update_updated_at();

-- ─── get_my_role ──────────────────────────────────────────────────────────────

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

-- ─── get_my_club_id ───────────────────────────────────────────────────────────

create or replace function public.get_my_club_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select club_id from public.profiles
  where auth_id = auth.uid() and role = 'club'
  limit 1
$$;

-- ─── get_my_judge_id ──────────────────────────────────────────────────────────

create or replace function public.get_my_judge_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select id from public.profiles
  where auth_id = auth.uid() and role = 'judge'
  limit 1
$$;

-- ─── is_competition_admin ─────────────────────────────────────────────────────

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

-- ─── is_judge_assigned_to_session ─────────────────────────────────────────────

create or replace function public.is_judge_assigned_to_session(p_session_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1
    from public.section_panel_judges spj
    join public.sessions s
      on s.panel_id = spj.panel_id and s.section_id = spj.section_id
    where s.id = p_session_id
      and spj.judge_id = public.get_my_judge_id()
  )
$$;

-- ─── assign_dorsal ────────────────────────────────────────────────────────────

create or replace function public.assign_dorsal()
returns trigger language plpgsql as $$
begin
  select coalesce(max(dorsal), 0) + 1
    into new.dorsal
    from public.competition_entries
   where competition_id = new.competition_id;
  return new;
end;
$$;

create trigger trg_assign_dorsal
  before insert on public.competition_entries
  for each row execute function public.assign_dorsal();

-- ─── handle_ts_upload ─────────────────────────────────────────────────────────

create or replace function public.handle_ts_upload()
returns trigger language plpgsql security definer as $$
begin
  if new.ts_path is distinct from old.ts_path and new.ts_path is not null then
    update public.ts_review_status
    set
      status       = 'new_ts',
      dj1_id       = null, dj1_decision = null, dj1_comment = null, dj1_at = null,
      dj2_id       = null, dj2_decision = null, dj2_comment = null, dj2_at = null,
      final_comment = null, notified_at = null
    where team_id        = new.team_id
      and competition_id = new.competition_id
      and routine_type   = new.routine_type
      and status in ('incorrect', 'checked');
  end if;
  return new;
end;
$$;

create trigger on_ts_upload
  after update on public.routine_music
  for each row execute function public.handle_ts_upload();

-- ─── handle_new_user ──────────────────────────────────────────────────────────
-- Fires on auth.users INSERT. Creates profile + entity rows from invite metadata.
-- No role in metadata → API handles profile creation manually (existing club invite).

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- ─── profiles ─────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for select using (auth_id = auth.uid());

create policy "profiles: admins read all" on public.profiles
  for select using (get_my_role() in ('super_admin', 'admin'));

create policy "profiles: own update" on public.profiles
  for update using (auth_id = auth.uid());

-- ─── admins ───────────────────────────────────────────────────────────────────

alter table public.admins enable row level security;

create policy "admins: own row" on public.admins
  for select using (
    id in (
      select id from public.profiles
      where auth_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

create policy "admins: auth read" on public.admins
  for select using (auth.role() = 'authenticated');

create policy "admins: super_admin all" on public.admins
  for all using (get_my_role() = 'super_admin');

create policy "admins: own update" on public.admins
  for update using (
    id in (
      select id from public.profiles
      where auth_id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- ─── judges ───────────────────────────────────────────────────────────────────

alter table public.judges enable row level security;

create policy "judges: authenticated read" on public.judges
  for select using (auth.role() = 'authenticated');

create policy "judges: super_admin all" on public.judges
  for all using (get_my_role() = 'super_admin');

create policy "judges: own update" on public.judges
  for update using (id = get_my_judge_id());

-- ─── clubs ────────────────────────────────────────────────────────────────────

alter table public.clubs enable row level security;

create policy "clubs: public read" on public.clubs
  for select using (true);

create policy "clubs: super_admin all" on public.clubs
  for all using (get_my_role() = 'super_admin');

create policy "clubs: own all" on public.clubs
  for all using (id = get_my_club_id());

-- ─── age_group_rules ──────────────────────────────────────────────────────────

alter table public.age_group_rules enable row level security;

create policy "age_group_rules: public read" on public.age_group_rules
  for select using (true);

create policy "age_group_rules: super_admin all" on public.age_group_rules
  for all using (get_my_role() = 'super_admin');

-- ─── gymnasts ─────────────────────────────────────────────────────────────────

alter table public.gymnasts enable row level security;

create policy "gymnasts: own club read/write" on public.gymnasts
  for all using (club_id = get_my_club_id());

create policy "gymnasts: admin read" on public.gymnasts
  for select using (get_my_role() in ('super_admin', 'admin'));

create policy "gymnasts: super_admin write" on public.gymnasts
  for all using (get_my_role() = 'super_admin');

-- ─── coaches ──────────────────────────────────────────────────────────────────

alter table public.coaches enable row level security;

create policy "coaches: club can manage own" on public.coaches
  for all using (club_id = get_my_club_id());

create policy "coaches: admins can read all" on public.coaches
  for select using (get_my_role() in ('super_admin', 'admin'));

-- ─── competition_coaches ──────────────────────────────────────────────────────

alter table public.competition_coaches enable row level security;

create policy "competition_coaches: club can manage own" on public.competition_coaches
  for all using (
    coach_id in (
      select id from public.coaches where club_id = get_my_club_id()
    )
  );

create policy "competition_coaches: admins can read all" on public.competition_coaches
  for select using (get_my_role() in ('super_admin', 'admin'));

-- ─── teams ────────────────────────────────────────────────────────────────────

alter table public.teams enable row level security;

create policy "teams: public read" on public.teams
  for select using (true);

create policy "teams: own club write" on public.teams
  for all using (club_id = get_my_club_id());

create policy "teams: super_admin all" on public.teams
  for all using (get_my_role() = 'super_admin');

-- ─── team_gymnasts ────────────────────────────────────────────────────────────

alter table public.team_gymnasts enable row level security;

create policy "team_gymnasts: public read" on public.team_gymnasts
  for select using (true);

create policy "team_gymnasts: own club write" on public.team_gymnasts
  for all using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and t.club_id = get_my_club_id()
    )
  );

create policy "team_gymnasts: super_admin all" on public.team_gymnasts
  for all using (get_my_role() = 'super_admin');

-- ─── competitions ─────────────────────────────────────────────────────────────

alter table public.competitions enable row level security;

create policy "competitions: public read" on public.competitions
  for select using (status in ('active', 'finished'));

create policy "competitions: auth read non-draft" on public.competitions
  for select using (
    auth.role() = 'authenticated'
    and status::text != 'draft'
  );

create policy "competitions: super_admin all" on public.competitions
  for all using (get_my_role() = 'super_admin');

create policy "competitions: admin read own" on public.competitions
  for select using (
    get_my_role() = 'admin'
    and exists (
      select 1 from public.profiles
      where id = admin_id and auth_id = auth.uid()
    )
  );

create policy "competitions: admin update own" on public.competitions
  for update using (
    get_my_role() = 'admin'
    and exists (
      select 1 from public.profiles
      where id = admin_id and auth_id = auth.uid()
    )
  );

-- ─── panels ───────────────────────────────────────────────────────────────────

alter table public.panels enable row level security;

create policy "panels: public read" on public.panels
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
  );

create policy "panels: auth read" on public.panels
  for select using (auth.role() = 'authenticated');

create policy "panels: super_admin all" on public.panels
  for all using (get_my_role() = 'super_admin');

create policy "panels: admin write own" on public.panels
  for all using (is_competition_admin(competition_id));

-- ─── sections ─────────────────────────────────────────────────────────────────

alter table public.sections enable row level security;

create policy "sections: public read" on public.sections
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
  );

create policy "sections: auth read" on public.sections
  for select using (auth.role() = 'authenticated');

create policy "sections: super_admin all" on public.sections
  for all using (get_my_role() = 'super_admin');

create policy "sections: admin write own" on public.sections
  for all using (is_competition_admin(competition_id));

-- ─── sessions ─────────────────────────────────────────────────────────────────

alter table public.sessions enable row level security;

create policy "sessions: public read" on public.sessions
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
  );

create policy "sessions: auth read" on public.sessions
  for select using (auth.role() = 'authenticated');

create policy "sessions: super_admin all" on public.sessions
  for all using (get_my_role() = 'super_admin');

create policy "sessions: admin write own" on public.sessions
  for all using (is_competition_admin(competition_id));

create policy "sessions: cjp update assigned" on public.sessions
  for update using (is_judge_assigned_to_session(id));

-- ─── section_panel_locks ──────────────────────────────────────────────────────

alter table public.section_panel_locks enable row level security;

create policy "section_panel_locks: auth read" on public.section_panel_locks
  for select using (auth.role() = 'authenticated');

create policy "section_panel_locks: super_admin all" on public.section_panel_locks
  for all using (get_my_role() = 'super_admin');

create policy "section_panel_locks: admin write own" on public.section_panel_locks
  for all using (is_competition_admin(section_id));

-- ─── competition_judge_nominations ────────────────────────────────────────────

alter table public.competition_judge_nominations enable row level security;

create policy "nominations: super_admin all" on public.competition_judge_nominations
  for all using (get_my_role() = 'super_admin');

create policy "nominations: admin read own" on public.competition_judge_nominations
  for select using (
    get_my_role() = 'admin'
    and is_competition_admin(competition_id)
  );

create policy "nominations: club own" on public.competition_judge_nominations
  for all using (club_id = get_my_club_id());

-- ─── section_panel_judges ─────────────────────────────────────────────────────

alter table public.section_panel_judges enable row level security;

create policy "spj: authenticated read" on public.section_panel_judges
  for select using (auth.role() = 'authenticated');

create policy "spj: super_admin all" on public.section_panel_judges
  for all using (get_my_role() = 'super_admin');

create policy "spj: admin write own" on public.section_panel_judges
  for all using (
    exists (
      select 1 from public.sections s
      where s.id = section_id and is_competition_admin(s.competition_id)
    )
  );

-- ─── competition_entries ──────────────────────────────────────────────────────

alter table public.competition_entries enable row level security;

create policy "entries: public read" on public.competition_entries
  for select using (
    exists (
      select 1 from public.competitions c
      where c.id = competition_id and c.status in ('active', 'finished')
    )
  );

create policy "entries: auth read" on public.competition_entries
  for select using (auth.role() = 'authenticated');

create policy "entries: super_admin all" on public.competition_entries
  for all using (get_my_role() = 'super_admin');

create policy "entries: admin update own" on public.competition_entries
  for update using (is_competition_admin(competition_id));

create policy "entries: club own teams" on public.competition_entries
  for all using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and t.club_id = get_my_club_id()
    )
  );

-- ─── session_orders ───────────────────────────────────────────────────────────

alter table public.session_orders enable row level security;

create policy "session_orders: public read locked" on public.session_orders
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.order_locked = true
    )
  );

create policy "session_orders: auth read" on public.session_orders
  for select using (auth.role() = 'authenticated');

create policy "session_orders: super_admin all" on public.session_orders
  for all using (get_my_role() = 'super_admin');

create policy "session_orders: admin write own" on public.session_orders
  for all using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and is_competition_admin(s.competition_id)
    )
  );

-- ─── routine_music ────────────────────────────────────────────────────────────

alter table public.routine_music enable row level security;

create policy "routine_music: own club" on public.routine_music
  for all using (
    exists (
      select 1 from public.teams t
      where t.id = team_id and t.club_id = get_my_club_id()
    )
  );

create policy "routine_music: admin read" on public.routine_music
  for select using (get_my_role() in ('super_admin', 'admin'));

create policy "routine_music: judge read" on public.routine_music
  for select using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id and s.panel_id = spj.panel_id
      where spj.judge_id = auth.uid()
        and s.competition_id = routine_music.competition_id
    )
  );

-- ─── ts_elements ──────────────────────────────────────────────────────────────

alter table public.ts_elements enable row level security;

create policy "ts_elements: judge read" on public.ts_elements
  for select using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id and s.panel_id = spj.panel_id
      where spj.judge_id = auth.uid()
        and s.competition_id = ts_elements.competition_id
    )
  );

create policy "ts_elements: dj write" on public.ts_elements
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id and s.panel_id = spj.panel_id
      where spj.judge_id = auth.uid()
        and spj.role = 'DJ'
        and s.competition_id = ts_elements.competition_id
    )
  );

create policy "ts_elements: admin read" on public.ts_elements
  for select using (get_my_role() in ('super_admin', 'admin'));

-- ─── ts_review_status ─────────────────────────────────────────────────────────

alter table public.ts_review_status enable row level security;

create policy "ts_review_status: dj all" on public.ts_review_status
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id and s.panel_id = spj.panel_id
      where spj.judge_id = auth.uid()
        and spj.role = 'DJ'
        and s.competition_id = ts_review_status.competition_id
    )
  );

create policy "ts_review_status: club read" on public.ts_review_status
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = ts_review_status.team_id
        and t.club_id = get_my_club_id()
    )
  );

create policy "ts_review_status: admin read" on public.ts_review_status
  for select using (get_my_role() in ('super_admin', 'admin'));

-- ─── scores ───────────────────────────────────────────────────────────────────

alter table public.scores enable row level security;

create policy "scores: cjp/admin read" on public.scores
  for select using (
    get_my_role() in ('super_admin', 'admin')
    or is_judge_assigned_to_session(session_id)
  );

create policy "scores: judge insert own" on public.scores
  for insert with check (
    section_panel_judge_id in (
      select id from public.section_panel_judges
      where judge_id = get_my_judge_id()
    )
  );

create policy "scores: judge update own" on public.scores
  for update
  using (
    section_panel_judge_id in (
      select id from public.section_panel_judges where judge_id = get_my_judge_id()
    )
  )
  with check (
    section_panel_judge_id in (
      select id from public.section_panel_judges where judge_id = get_my_judge_id()
    )
  );

-- ─── routine_results ──────────────────────────────────────────────────────────

alter table public.routine_results enable row level security;

create policy "results: public read approved" on public.routine_results
  for select using (status = 'approved');

create policy "results: auth read all" on public.routine_results
  for select using (auth.role() = 'authenticated');

create policy "results: cjp insert" on public.routine_results
  for insert with check (is_judge_assigned_to_session(session_id));

create policy "results: cjp update" on public.routine_results
  for update
  using (is_judge_assigned_to_session(session_id))
  with check (is_judge_assigned_to_session(session_id));

create policy "results: super_admin all" on public.routine_results
  for all using (get_my_role() = 'super_admin');

-- =============================================================================
-- SEED DATA — Age group rules
-- =============================================================================

insert into public.age_group_rules (age_group, ruleset, routine_count, min_age, max_age, sort_order) values
  -- FIG
  ('Senior',           'FIG',  3, 15, null,  1),
  ('Junior',           'FIG',  3, 13,   19,  2),
  ('Youth',            'FIG',  3, 12,   18,  3),
  ('Pre-Youth',        'FIG',  2, 11,   16,  4),
  -- RFEG
  ('Senior',           'RFEG', 3, 12, null,  5),
  ('Junior',           'RFEG', 3, 11,   19,  6),
  ('Youth',            'RFEG', 3, 10,   18,  7),
  ('Pre-Youth',        'RFEG', 2,  9,   11,  8),
  ('Cadete',           'RFEG', 1,  8,   15,  9),
  ('Infantil',         'RFEG', 1,  8,   13, 10),
  ('Alevín',           'RFEG', 1,  7,   12, 11),
  ('Senior Base',      'RFEG', 2, 12, null, 12),
  ('Junior Base',      'RFEG', 2, 10,   19, 13),
  ('Cadete Base',      'RFEG', 1,  8,   16, 14),
  ('Infantil Base',    'RFEG', 1,  8,   14, 15),
  ('Alevín Base',      'RFEG', 1,  7,   13, 16),
  -- FGX
  ('Absoluto Escolar', 'FGX',  1,  6, null, 17),
  ('Infantil Escolar', 'FGX',  1,  7,   15, 18),
  ('Alevín Escolar',   'FGX',  1,  6,   13, 19),
  ('Benxamín Escolar', 'FGX',  1,  6,   11, 20);

-- =============================================================================
-- STORAGE BUCKETS (create manually in Supabase dashboard)
-- =============================================================================
-- gymnasts-photos   — gymnast profile photos
-- gymnast-licencias — gymnast licence PDFs
-- coaches-photos    — coach profile photos
-- coach-licencias   — coach licence PDFs
-- team-photos       — team photos
-- club-logos        — club avatar images
-- judge-photos      — judge profile photos
-- musics            — routine music files
-- TS                — technical sheet PDFs

-- =============================================================================
-- NOSA ACRO SUITE — Full schema for a fresh staging/testing database
-- Generated from migrations + database.types.ts (staging branch, May 2026)
--
-- Run this in the Supabase SQL editor on a brand-new project.
-- After running this file, also run:
--   supabase/migrations/20260501000000_age_groups_rg.sql   (RG age group seed)
--   supabase/migrations/20260501000001_rg_apparatus_rules.sql (RG apparatus rules)
--   supabase/migrations/20260508000000_age_group_level.sql  (normalise level column)
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type public.user_role as enum (
  'super_admin', 'admin', 'judge', 'club'
);

create type public.competition_status as enum (
  'draft',
  'provisional_entry',
  'definitive_entry',
  'registration_open',
  'registration_closed',
  'published',
  'active',
  'finished'
);

create type public.session_status as enum ('waiting', 'active', 'finished');

create type public.judge_role as enum (
  'CJP', 'EJ', 'AJ', 'DJ',
  'RJ', 'E', 'A', 'DA', 'DB'
);

create type public.routine_type as enum (
  'Balance', 'Dynamic', 'Combined',
  'Free', 'Hoop', 'Ball', 'Clubs', 'Ribbon', 'Rope'
);

create type public.result_status as enum ('provisional', 'approved');

-- ─── RLS helper functions (must exist before any policy references them) ─────
-- Skip body validation so forward-referenced tables (profiles, competitions, etc.)
-- don't cause errors during bootstrap. Bodies are validated at call time.
set check_function_bodies = off;

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

create or replace function public.get_my_club_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select club_id from public.profiles
  where auth_id = auth.uid() and role = 'club'
  limit 1
$$;

create or replace function public.get_my_judge_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select id from public.profiles
  where auth_id = auth.uid() and role = 'judge'
  limit 1
$$;

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

reset check_function_bodies;

-- ─── Tables (FK dependency order) ────────────────────────────────────────────

-- age_group_rules
create table public.age_group_rules (
  id            uuid     primary key default uuid_generate_v4(),
  age_group     text     not null,
  level         text     not null,
  ruleset       text     not null,
  routine_count smallint not null default 1,
  min_age       integer  not null,
  max_age       integer,
  sort_order    smallint not null default 0,
  sport_type    text     not null default 'acro',
  unique (age_group, level, ruleset)
);

alter table public.age_group_rules enable row level security;
create policy "age_group_rules: public read" on public.age_group_rules for select using (true);
create policy "age_group_rules: super_admin all" on public.age_group_rules for all using (get_my_role() = 'super_admin');

-- apparatus
create table public.apparatus (
  id         uuid    primary key default gen_random_uuid(),
  name       text    not null unique,
  name_es    text,
  sort_order integer not null default 0
);

-- apparatus_rules
create table public.apparatus_rules (
  id                uuid    primary key default gen_random_uuid(),
  age_group_rule_id uuid    not null references public.age_group_rules(id) on delete cascade,
  year              integer not null,
  apparatus_id      uuid    not null references public.apparatus(id) on delete cascade,
  is_mandatory      boolean not null default true,
  sort_order        integer not null default 0
);

-- clubs (standalone — no longer extends profiles)
create table public.clubs (
  id           uuid primary key default gen_random_uuid(),
  club_name    text not null,
  contact_name text,
  phone        text,
  avatar_url   text
);

alter table public.clubs enable row level security;
create policy "clubs: public read"    on public.clubs for select using (true);
create policy "clubs: super_admin all" on public.clubs for all using (get_my_role() = 'super_admin');
create policy "clubs: own all"        on public.clubs for all using (id = get_my_club_id());

-- profiles (auth_id = auth.uid(); no FK constraint — cross-schema)
create table public.profiles (
  id         uuid             primary key default gen_random_uuid(),
  auth_id    uuid             unique,
  club_id    uuid             references public.clubs(id) on delete set null,
  email      text,
  role       public.user_role not null,
  created_at timestamptz      not null default now(),
  updated_at timestamptz      not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles: own row"     on public.profiles for select using (auth_id = auth.uid());
create policy "profiles: admins read" on public.profiles for select using (get_my_role() in ('super_admin', 'admin'));
create policy "profiles: own update"  on public.profiles for update using (auth_id = auth.uid());

-- admins
create table public.admins (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  club_name  text,
  phone      text,
  avatar_url text
);

alter table public.admins enable row level security;
create policy "admins: own row"      on public.admins for select using (id in (select id from public.profiles where auth_id = auth.uid() and role in ('admin','super_admin')));
create policy "admins: auth read"    on public.admins for select using (auth.role() = 'authenticated');
create policy "admins: super_admin all" on public.admins for all using (get_my_role() = 'super_admin');
create policy "admins: own update"   on public.admins for update using (id in (select id from public.profiles where auth_id = auth.uid() and role in ('admin','super_admin')));

-- judges
create table public.judges (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  licence    text,
  phone      text,
  avatar_url text,
  sport_type text not null default 'acro'
);

alter table public.judges enable row level security;
create policy "judges: authenticated read" on public.judges for select using (auth.role() = 'authenticated');
create policy "judges: super_admin all"    on public.judges for all   using (get_my_role() = 'super_admin');
create policy "judges: own update"         on public.judges for update using (id = get_my_judge_id());

-- coaches (club-owned, no auth account)
create table public.coaches (
  id           uuid        primary key default gen_random_uuid(),
  club_id      uuid        not null references public.clubs(id) on delete cascade,
  full_name    text        not null,
  licence      text,
  photo_url    text,
  licencia_url text,
  created_at   timestamptz default now()
);

alter table public.coaches enable row level security;
create policy "coaches: club own"     on public.coaches for all    using (club_id in (select club_id from public.profiles where auth_id = auth.uid() and role = 'club'));
create policy "coaches: admin read"   on public.coaches for select using (exists (select 1 from public.profiles where auth_id = auth.uid() and role in ('super_admin','admin')));

-- gymnasts
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

alter table public.gymnasts enable row level security;
create policy "gymnasts: own club"       on public.gymnasts for all    using (club_id = get_my_club_id());
create policy "gymnasts: admin read"     on public.gymnasts for select using (get_my_role() in ('super_admin','admin'));
create policy "gymnasts: super_admin all" on public.gymnasts for all    using (get_my_role() = 'super_admin');

-- teams
create table public.teams (
  id              uuid        primary key default uuid_generate_v4(),
  club_id         uuid        not null references public.clubs(id) on delete cascade,
  category        text        not null,
  age_group       text        not null,
  gymnast_display text        not null,
  photo_url       text,
  sport_type      text        not null default 'acro',
  archived_at     timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.teams enable row level security;
create policy "teams: public read"     on public.teams for select using (true);
create policy "teams: own club write"  on public.teams for all    using (club_id = get_my_club_id());
create policy "teams: super_admin all" on public.teams for all    using (get_my_role() = 'super_admin');

-- team_gymnasts
create table public.team_gymnasts (
  team_id    uuid not null references public.teams(id)    on delete cascade,
  gymnast_id uuid not null references public.gymnasts(id) on delete cascade,
  primary key (team_id, gymnast_id)
);

alter table public.team_gymnasts enable row level security;
create policy "team_gymnasts: public read"    on public.team_gymnasts for select using (true);
create policy "team_gymnasts: own club write" on public.team_gymnasts for all    using (exists (select 1 from public.teams t where t.id = team_id and t.club_id = get_my_club_id()));
create policy "team_gymnasts: super_admin all" on public.team_gymnasts for all   using (get_my_role() = 'super_admin');

-- team_apparatus
create table public.team_apparatus (
  team_id      uuid not null references public.teams(id)     on delete cascade,
  apparatus_id uuid not null references public.apparatus(id) on delete cascade,
  primary key (team_id, apparatus_id)
);

alter table public.team_apparatus enable row level security;
create policy "team_apparatus: public read" on public.team_apparatus for select using (true);
create policy "team_apparatus: club own"    on public.team_apparatus for all    using (exists (select 1 from public.teams t where t.id = team_apparatus.team_id and t.club_id = get_my_club_id()));
create policy "team_apparatus: admin all"   on public.team_apparatus for all    using (get_my_role() in ('super_admin','admin'));

-- competitions
create table public.competitions (
  id                         uuid                      primary key default uuid_generate_v4(),
  name                       text                      not null,
  status                     public.competition_status not null default 'draft',
  sport_type                 text                      not null default 'acro',
  location                   text,
  start_date                 date,
  end_date                   date,
  registration_deadline      date,
  provisional_entry_deadline date,
  definitive_entry_deadline  date,
  ts_music_deadline          date,
  age_groups                 text[]                    not null default '{}',
  poster_url                 text,
  logo_url                   text,
  fee_per_team               numeric,
  fee_per_gymnast            numeric,
  judge_missing_fine         numeric,
  open_combinados_enabled    boolean                   not null default false,
  tv_sponsor_videos          jsonb                     not null default '[]',
  admin_id                   uuid                      references public.admins(id) on delete set null,
  created_by                 uuid                      references public.admins(id) on delete set null,
  created_at                 timestamptz               not null default now(),
  updated_at                 timestamptz               not null default now()
);

alter table public.competitions enable row level security;
create policy "competitions: public read"         on public.competitions for select using (status is distinct from 'draft');
create policy "competitions: auth read non-draft" on public.competitions for select using (auth.role() = 'authenticated' and status::text != 'draft');
create policy "competitions: super_admin all"     on public.competitions for all    using (get_my_role() = 'super_admin');
create policy "competitions: admin read own"      on public.competitions for select using (get_my_role() = 'admin' and exists (select 1 from public.profiles where id = admin_id and auth_id = auth.uid()));
create policy "competitions: admin update own"    on public.competitions for update using (get_my_role() = 'admin' and exists (select 1 from public.profiles where id = admin_id and auth_id = auth.uid()));

-- panels
create table public.panels (
  id             uuid     primary key default uuid_generate_v4(),
  competition_id uuid     not null references public.competitions(id) on delete cascade,
  panel_number   smallint not null check (panel_number in (1, 2)),
  unique (competition_id, panel_number)
);

alter table public.panels enable row level security;
create policy "panels: public read"    on public.panels for select using (exists (select 1 from public.competitions c where c.id = competition_id and c.status in ('active','finished')));
create policy "panels: auth read"      on public.panels for select using (auth.role() = 'authenticated');
create policy "panels: super_admin all" on public.panels for all   using (get_my_role() = 'super_admin');
create policy "panels: admin write own" on public.panels for all   using (is_competition_admin(competition_id));

-- sections
create table public.sections (
  id                      uuid     primary key default uuid_generate_v4(),
  competition_id          uuid     not null references public.competitions(id) on delete cascade,
  section_number          smallint not null,
  label                   text,
  starting_time           time,
  waiting_time_seconds    integer,
  warmup_duration_minutes integer,
  timeline_order          jsonb,
  unique (competition_id, section_number)
);

alter table public.sections enable row level security;
create policy "sections: public read"    on public.sections for select using (exists (select 1 from public.competitions c where c.id = competition_id and c.status in ('active','finished')));
create policy "sections: auth read"      on public.sections for select using (auth.role() = 'authenticated');
create policy "sections: super_admin all" on public.sections for all   using (get_my_role() = 'super_admin');
create policy "sections: admin write own" on public.sections for all   using (is_competition_admin(competition_id));

-- ranking_merge_groups
create table public.ranking_merge_groups (
  id             uuid        primary key default gen_random_uuid(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  label_es       text,
  label_en       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.ranking_merge_groups enable row level security;
create policy "ranking_merge_groups: public read"    on public.ranking_merge_groups for select using (exists (select 1 from public.competitions c where c.id = competition_id and c.status in ('active','finished')));
create policy "ranking_merge_groups: auth read"      on public.ranking_merge_groups for select using (auth.role() = 'authenticated');
create policy "ranking_merge_groups: super_admin all" on public.ranking_merge_groups for all   using (get_my_role() = 'super_admin');
create policy "ranking_merge_groups: admin write own" on public.ranking_merge_groups for all   using (is_competition_admin(competition_id));

-- sessions
create table public.sessions (
  id                     uuid                  primary key default uuid_generate_v4(),
  competition_id         uuid                  not null references public.competitions(id)      on delete cascade,
  panel_id               uuid                  not null references public.panels(id)            on delete cascade,
  section_id             uuid                  not null references public.sections(id)          on delete cascade,
  ranking_merge_group_id uuid                  references public.ranking_merge_groups(id)       on delete set null,
  name                   text                  not null,
  age_group              text                  not null,
  category               text                  not null,
  routine_type           public.routine_type   not null,
  status                 public.session_status not null default 'waiting',
  order_index            smallint              not null default 1,
  order_locked           boolean               not null default false,
  current_team_id        uuid                  references public.teams(id) on delete set null,
  dj_device              text,
  dj_method              text,
  ej_device              text,
  ej_method              text
);

alter table public.sessions enable row level security;
create policy "sessions: public read"     on public.sessions for select using (exists (select 1 from public.competitions c where c.id = competition_id and c.status in ('active','finished')));
create policy "sessions: auth read"       on public.sessions for select using (auth.role() = 'authenticated');
create policy "sessions: super_admin all" on public.sessions for all   using (get_my_role() = 'super_admin');
create policy "sessions: admin write own" on public.sessions for all   using (is_competition_admin(competition_id));
create policy "sessions: cjp update"     on public.sessions for update using (is_judge_assigned_to_session(id));

-- competition_entries
create table public.competition_entries (
  id              uuid        primary key default uuid_generate_v4(),
  competition_id  uuid        not null references public.competitions(id) on delete cascade,
  team_id         uuid        not null references public.teams(id)        on delete cascade,
  dropped_out     boolean     not null default false,
  dorsal          integer,
  gymnast_display text,
  gymnast_ids     uuid[],
  registered_at   timestamptz not null default now(),
  unique (competition_id, team_id)
);

alter table public.competition_entries enable row level security;
create policy "entries: public read"     on public.competition_entries for select using (exists (select 1 from public.competitions c where c.id = competition_id and c.status in ('active','finished')));
create policy "entries: auth read"       on public.competition_entries for select using (auth.role() = 'authenticated');
create policy "entries: super_admin all" on public.competition_entries for all    using (get_my_role() = 'super_admin');
create policy "entries: admin update"    on public.competition_entries for update using (is_competition_admin(competition_id));
create policy "entries: club own teams"  on public.competition_entries for all    using (exists (select 1 from public.teams t where t.id = team_id and t.club_id = get_my_club_id()));

-- session_orders
create table public.session_orders (
  session_id uuid     not null references public.sessions(id) on delete cascade,
  team_id    uuid     not null references public.teams(id)    on delete cascade,
  position   smallint not null,
  primary key (session_id, team_id)
);

alter table public.session_orders enable row level security;
create policy "session_orders: public read locked" on public.session_orders for select using (exists (select 1 from public.sessions s where s.id = session_id and s.order_locked = true));
create policy "session_orders: auth read"          on public.session_orders for select using (auth.role() = 'authenticated');
create policy "session_orders: super_admin all"    on public.session_orders for all    using (get_my_role() = 'super_admin');
create policy "session_orders: admin write own"    on public.session_orders for all    using (exists (select 1 from public.sessions s where s.id = session_id and is_competition_admin(s.competition_id)));

-- competition_judge_nominations
create table public.competition_judge_nominations (
  id             uuid primary key default uuid_generate_v4(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  judge_id       uuid not null references public.judges(id)       on delete cascade,
  club_id        uuid          references public.clubs(id)        on delete set null,
  unique (competition_id, judge_id)
);

alter table public.competition_judge_nominations enable row level security;
create policy "nominations: super_admin all"  on public.competition_judge_nominations for all    using (get_my_role() = 'super_admin');
create policy "nominations: admin read own"   on public.competition_judge_nominations for select using (get_my_role() = 'admin' and is_competition_admin(competition_id));
create policy "nominations: club own"         on public.competition_judge_nominations for all    using (club_id = get_my_club_id());

-- section_panel_judges
create table public.section_panel_judges (
  id          uuid              primary key default uuid_generate_v4(),
  section_id  uuid              not null references public.sections(id) on delete cascade,
  panel_id    uuid              not null references public.panels(id)   on delete cascade,
  judge_id    uuid              references public.judges(id)            on delete set null,
  role        public.judge_role not null,
  role_number smallint          not null default 1
);

alter table public.section_panel_judges enable row level security;
create policy "spj: authenticated read" on public.section_panel_judges for select using (auth.role() = 'authenticated');
create policy "spj: super_admin all"    on public.section_panel_judges for all    using (get_my_role() = 'super_admin');
create policy "spj: admin write own"    on public.section_panel_judges for all    using (exists (select 1 from public.sections s where s.id = section_id and is_competition_admin(s.competition_id)));

-- section_panel_locks
create table public.section_panel_locks (
  section_id uuid        not null references public.sections(id) on delete cascade,
  panel_id   uuid        not null references public.panels(id)   on delete cascade,
  locked     boolean     not null default false,
  updated_at timestamptz not null default now(),
  primary key (section_id, panel_id)
);

alter table public.section_panel_locks enable row level security;
create policy "section_panel_locks: auth read"      on public.section_panel_locks for select using (auth.role() = 'authenticated');
create policy "section_panel_locks: admin write own" on public.section_panel_locks for all   using (exists (select 1 from public.sections s where s.id = section_id and is_competition_admin(s.competition_id)));
create policy "section_panel_locks: super_admin all" on public.section_panel_locks for all   using (get_my_role() = 'super_admin');

-- routine_music
create table public.routine_music (
  id             uuid                primary key default uuid_generate_v4(),
  team_id        uuid                not null references public.teams(id)        on delete cascade,
  competition_id uuid                not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  music_path     text,
  ts_path        text,
  uploaded_at    timestamptz         not null default now(),
  unique (team_id, competition_id, routine_type)
);

alter table public.routine_music enable row level security;
create policy "routine_music: own club"              on public.routine_music for all    using (exists (select 1 from public.teams t where t.id = team_id and t.club_id = get_my_club_id()));
create policy "routine_music: admin read"            on public.routine_music for select using (get_my_role() in ('super_admin','admin'));
create policy "routine_music: competition admin read" on public.routine_music for select using (is_competition_admin(competition_id));
create policy "routine_music: judge read"            on public.routine_music for select using (exists (select 1 from public.section_panel_judges spj join public.sessions s on s.section_id = spj.section_id and s.panel_id = spj.panel_id where spj.judge_id = get_my_judge_id() and s.competition_id = routine_music.competition_id));

-- ts_elements
create table public.ts_elements (
  id               uuid                primary key default gen_random_uuid(),
  team_id          uuid                not null references public.teams(id)        on delete cascade,
  competition_id   uuid                not null references public.competitions(id) on delete cascade,
  routine_type     public.routine_type not null,
  position         integer             not null,
  label            text                not null default '',
  element_type     text                not null,
  is_static        boolean             not null default false,
  difficulty_value numeric(5,2)        not null default 0,
  created_at       timestamptz         not null default now()
);

alter table public.ts_elements enable row level security;
create policy "ts_elements: judge read"  on public.ts_elements for select using (exists (select 1 from public.section_panel_judges spj join public.sessions s on s.section_id = spj.section_id and s.panel_id = spj.panel_id where spj.judge_id = get_my_judge_id() and s.competition_id = ts_elements.competition_id));
create policy "ts_elements: dj write"   on public.ts_elements for all    using (exists (select 1 from public.section_panel_judges spj join public.sessions s on s.section_id = spj.section_id and s.panel_id = spj.panel_id where spj.judge_id = get_my_judge_id() and spj.role = 'DJ' and s.competition_id = ts_elements.competition_id));
create policy "ts_elements: admin read" on public.ts_elements for select using (get_my_role() in ('super_admin','admin'));

-- ts_review_status
create table public.ts_review_status (
  team_id        uuid                not null references public.teams(id)        on delete cascade,
  competition_id uuid                not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  status         text                not null default 'pending',
  dj1_id         uuid                references public.judges(id),
  dj1_decision   text,
  dj1_comment    text,
  dj1_at         timestamptz,
  dj2_id         uuid                references public.judges(id),
  dj2_decision   text,
  dj2_comment    text,
  dj2_at         timestamptz,
  final_comment  text,
  notified_at    timestamptz,
  primary key (team_id, competition_id, routine_type)
);

alter table public.ts_review_status enable row level security;
create policy "ts_review_status: dj all"    on public.ts_review_status for all    using (exists (select 1 from public.section_panel_judges spj join public.sessions s on s.section_id = spj.section_id and s.panel_id = spj.panel_id where spj.judge_id = get_my_judge_id() and spj.role = 'DJ' and s.competition_id = ts_review_status.competition_id));
create policy "ts_review_status: club read" on public.ts_review_status for select using (exists (select 1 from public.teams t where t.id = ts_review_status.team_id and t.club_id = get_my_club_id()));
create policy "ts_review_status: admin read" on public.ts_review_status for select using (get_my_role() in ('super_admin','admin'));

-- scores
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
  db_score               numeric,
  dj_flags               jsonb,
  dj_extra_elements      jsonb,
  dj_incorrect_ts        boolean,
  ej_deductions          jsonb,
  ej_extra_elements      jsonb,
  submitted_at           timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (session_id, team_id, section_panel_judge_id)
);

alter table public.scores enable row level security;
create policy "scores: cjp/admin read" on public.scores for select using (get_my_role() in ('super_admin','admin') or is_judge_assigned_to_session(session_id));
create policy "scores: judge insert"   on public.scores for insert with check (section_panel_judge_id in (select id from public.section_panel_judges where judge_id = get_my_judge_id()));
create policy "scores: judge update"   on public.scores for update using (section_panel_judge_id in (select id from public.section_panel_judges where judge_id = get_my_judge_id())) with check (section_panel_judge_id in (select id from public.section_panel_judges where judge_id = get_my_judge_id()));

-- routine_results
create table public.routine_results (
  id                 uuid                 primary key default uuid_generate_v4(),
  session_id         uuid                 not null references public.sessions(id) on delete cascade,
  team_id            uuid                 not null references public.teams(id)    on delete cascade,
  e_score            numeric(5,3),
  a_score            numeric(5,3),
  dif_score          numeric(5,2),
  dif_penalty        numeric(4,1),
  cjp_penalty        numeric(4,1),
  cjp_penalty_detail jsonb,
  dj_penalty_detail  jsonb,
  da_score           numeric,
  db_score           numeric,
  rj_penalty         numeric,
  rj_penalty_detail  jsonb,
  final_score        numeric(6,3),
  status             public.result_status not null default 'provisional',
  approved_by        uuid                 references public.judges(id) on delete set null,
  approved_at        timestamptz,
  created_at         timestamptz          not null default now(),
  updated_at         timestamptz          not null default now(),
  unique (session_id, team_id)
);

alter table public.routine_results enable row level security;
create policy "results: public read approved" on public.routine_results for select using (status = 'approved');
create policy "results: auth read all"        on public.routine_results for select using (auth.role() = 'authenticated');
create policy "results: cjp insert"           on public.routine_results for insert with check (is_judge_assigned_to_session(session_id));
create policy "results: cjp update"           on public.routine_results for update using (is_judge_assigned_to_session(session_id)) with check (is_judge_assigned_to_session(session_id));
create policy "results: super_admin all"      on public.routine_results for all    using (get_my_role() = 'super_admin');

-- tv_state
create table public.tv_state (
  id                     uuid        not null default gen_random_uuid(),
  competition_id         uuid        not null references public.competitions(id) on delete cascade,
  session_id             uuid                 references public.sessions(id)     on delete set null,
  team_id                uuid                 references public.teams(id)        on delete set null,
  revealed               boolean     not null default false,
  sponsor_reel_enabled   boolean     not null default false,
  sponsor_playlist_index integer     not null default 0,
  updated_at             timestamptz not null default now(),
  primary key (id),
  unique (competition_id)
);

alter table public.tv_state enable row level security;
create policy "tv_state: public read"             on public.tv_state for select using (true);
create policy "tv_state: admin write"             on public.tv_state for all    using (get_my_role() in ('super_admin','admin'));
create policy "tv_state: competition admin write" on public.tv_state for all    to authenticated using (is_competition_admin(competition_id)) with check (is_competition_admin(competition_id));

-- provisional_entries
create table public.provisional_entries (
  id                 uuid        primary key default gen_random_uuid(),
  competition_id     uuid        not null references public.competitions(id) on delete cascade,
  club_id            uuid        not null references public.clubs(id)        on delete cascade,
  teams_per_category jsonb       not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (competition_id, club_id)
);

alter table public.provisional_entries enable row level security;
create policy "clubs_own_provisional"   on public.provisional_entries for all    to authenticated using (club_id = get_my_club_id()) with check (club_id = get_my_club_id());
create policy "admins_read_provisional" on public.provisional_entries for select to authenticated using (is_competition_admin(competition_id) or get_my_role() in ('admin','super_admin'));

-- definitive_entries
create table public.definitive_entries (
  id                   uuid        primary key default gen_random_uuid(),
  competition_id       uuid        not null references public.competitions(id) on delete cascade,
  club_id              uuid        not null references public.clubs(id)        on delete cascade,
  contact_name         text        not null default '',
  contact_phone        text        not null default '',
  contact_email        text        not null default '',
  teams_per_category   jsonb       not null default '{}',
  judge_name           text,
  total_amount         numeric     not null default 0,
  status               text        not null default 'pending' check (status in ('pending','payment_uploaded','approved','rejected')),
  payment_document_url text,
  admin_notes          text,
  reviewed_at          timestamptz,
  reviewed_by          uuid                 references public.admins(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (competition_id, club_id)
);

alter table public.definitive_entries enable row level security;
create policy "clubs_read_own_definitive" on public.definitive_entries for select    to authenticated using (club_id = get_my_club_id());
create policy "clubs_insert_definitive"   on public.definitive_entries for insert    to authenticated with check (club_id = get_my_club_id());
create policy "clubs_update_definitive"   on public.definitive_entries for update    to authenticated using (club_id = get_my_club_id()) with check (club_id = get_my_club_id());
create policy "admins_manage_definitive"  on public.definitive_entries for all       to authenticated using (is_competition_admin(competition_id) or get_my_role() in ('admin','super_admin'));

-- competition_allowed_clubs
create table public.competition_allowed_clubs (
  id             uuid        primary key default gen_random_uuid(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  club_id        uuid        not null references public.clubs(id)        on delete cascade,
  source         text        not null default 'manual' check (source in ('definitive_entry','manual')),
  created_at     timestamptz not null default now(),
  unique (competition_id, club_id)
);

alter table public.competition_allowed_clubs enable row level security;
create policy "admins_manage_allowed_clubs" on public.competition_allowed_clubs for all    to authenticated using (is_competition_admin(competition_id) or get_my_role() in ('admin','super_admin'));
create policy "clubs_read_own_allowed"      on public.competition_allowed_clubs for select to authenticated using (club_id = get_my_club_id());
create policy "anon_read_allowed_clubs"     on public.competition_allowed_clubs for select to anon using (true);

-- rg_registrations
create table public.rg_registrations (
  id                   uuid        primary key default gen_random_uuid(),
  team_id              uuid        not null references public.teams(id)        on delete cascade,
  competition_id       uuid        not null references public.competitions(id) on delete cascade,
  status               text        not null default 'pending',
  payment_document_url text,
  notes                text,
  approved_by          uuid                 references public.profiles(id),
  approved_at          timestamptz,
  payment_approved_by  uuid                 references public.profiles(id),
  payment_approved_at  timestamptz,
  created_at           timestamptz not null default now(),
  unique (team_id, competition_id)
);

alter table public.rg_registrations enable row level security;
create policy "rg_registrations: admin all"      on public.rg_registrations for all    using (get_my_role() in ('super_admin','admin'));
create policy "rg_registrations: club read own"  on public.rg_registrations for select using (exists (select 1 from public.teams t where t.id = rg_registrations.team_id and t.club_id = get_my_club_id()));
create policy "rg_registrations: club insert own" on public.rg_registrations for insert with check (exists (select 1 from public.teams t where t.id = rg_registrations.team_id and t.club_id = get_my_club_id()));
create policy "rg_registrations: club update own" on public.rg_registrations for update using (exists (select 1 from public.teams t where t.id = rg_registrations.team_id and t.club_id = get_my_club_id())) with check (exists (select 1 from public.teams t where t.id = rg_registrations.team_id and t.club_id = get_my_club_id()));

-- competition_coaches
create table public.competition_coaches (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  coach_id       uuid not null references public.coaches(id)      on delete cascade,
  unique (competition_id, coach_id)
);

alter table public.competition_coaches enable row level security;
create policy "club can manage own competition_coaches" on public.competition_coaches for all    using (coach_id in (select c.id from public.coaches c join public.profiles p on p.club_id = c.club_id where p.auth_id = auth.uid() and p.role = 'club'));
create policy "admins can read all competition_coaches" on public.competition_coaches for select using (exists (select 1 from public.profiles where auth_id = auth.uid() and role in ('super_admin','admin')));

-- competition_music_unlocks
create table public.competition_music_unlocks (
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  team_id        uuid        not null references public.teams(id)        on delete cascade,
  enabled        boolean     not null default true,
  updated_at     timestamptz not null default now(),
  primary key (competition_id, team_id)
);

alter table public.competition_music_unlocks enable row level security;
create policy "competition_music_unlocks: read"  on public.competition_music_unlocks for select using (true);
create policy "competition_music_unlocks: write" on public.competition_music_unlocks for all    using (is_competition_admin(competition_id) or get_my_role() in ('super_admin','admin'));

-- open_combinados_bracket_config
create table public.open_combinados_bracket_config (
  competition_id         uuid primary key references public.competitions(id) on delete cascade,
  combinados_semi_count  integer     not null default 0,
  combinados_final_count integer     not null default 12,
  open_quarter_count     integer     not null default 0,
  open_semi_count        integer     not null default 12,
  open_final_count       integer     not null default 8,
  updated_at             timestamptz not null default now()
);

alter table public.open_combinados_bracket_config enable row level security;
create policy "open_combinados_bracket_config: read"  on public.open_combinados_bracket_config for select using (true);
create policy "open_combinados_bracket_config: write" on public.open_combinados_bracket_config for all    using (is_competition_admin(competition_id) or get_my_role() in ('super_admin','admin'));

-- open_combinados_phase_sessions
create table public.open_combinados_phase_sessions (
  id             uuid                primary key default gen_random_uuid(),
  competition_id uuid                not null references public.competitions(id) on delete cascade,
  phase_key      text                not null,
  group_key      text                not null check (group_key in ('OPEN','COMBINADOS')),
  routine_type   public.routine_type not null,
  session_id     uuid                not null references public.sessions(id) on delete cascade,
  unique (competition_id, phase_key),
  unique (session_id)
);

alter table public.open_combinados_phase_sessions enable row level security;
create policy "open_combinados_phase_sessions: read"  on public.open_combinados_phase_sessions for select using (true);
create policy "open_combinados_phase_sessions: write" on public.open_combinados_phase_sessions for all    using (is_competition_admin(competition_id) or get_my_role() in ('super_admin','admin'));

-- open_combinados_open_team_choices
create table public.open_combinados_open_team_choices (
  id                    uuid                primary key default gen_random_uuid(),
  competition_id        uuid                not null references public.competitions(id) on delete cascade,
  phase_key             text                not null,
  team_id               uuid                not null references public.teams(id) on delete cascade,
  selected_routine_type public.routine_type not null,
  updated_at            timestamptz         not null default now(),
  unique (competition_id, phase_key, team_id)
);

alter table public.open_combinados_open_team_choices enable row level security;
create policy "open_combinados_open_team_choices: read"  on public.open_combinados_open_team_choices for select using (true);
create policy "open_combinados_open_team_choices: write" on public.open_combinados_open_team_choices for all    using (is_competition_admin(competition_id) or get_my_role() in ('super_admin','admin'));

-- section_practice_state
create table public.section_practice_state (
  id                 uuid        primary key default gen_random_uuid(),
  section_id         uuid        not null references public.sections(id)    on delete cascade,
  competition_id     uuid        not null references public.competitions(id) on delete cascade,
  routine_session_id uuid        not null references public.sessions(id)    on delete cascade,
  routine_team_id    uuid        not null references public.teams(id)       on delete cascade,
  active             boolean     not null default true,
  started_by         uuid                 references public.judges(id)      on delete set null,
  started_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (section_id)
);

alter table public.section_practice_state enable row level security;
create policy "section_practice_state: read assigned" on public.section_practice_state for select to authenticated using (get_my_role() in ('super_admin','admin') or is_competition_admin(competition_id) or exists (select 1 from public.section_panel_judges spj where spj.section_id = section_practice_state.section_id and spj.judge_id = get_my_judge_id()));
create policy "section_practice_state: write cjp"    on public.section_practice_state for all    to authenticated using (get_my_role() in ('super_admin','admin') or is_competition_admin(competition_id) or exists (select 1 from public.section_panel_judges spj where spj.section_id = section_practice_state.section_id and spj.judge_id = get_my_judge_id() and spj.role = 'CJP')) with check (get_my_role() in ('super_admin','admin') or is_competition_admin(competition_id) or exists (select 1 from public.section_panel_judges spj where spj.section_id = section_practice_state.section_id and spj.judge_id = get_my_judge_id() and spj.role = 'CJP'));

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index on public.profiles (role);
create index on public.profiles (auth_id);
create index on public.profiles (club_id);
create index on public.competitions (status);
create index on public.competitions (admin_id);
create index on public.panels (competition_id);
create index on public.sections (competition_id);
create index on public.sessions (competition_id);
create index on public.sessions (panel_id);
create index on public.sessions (section_id);
create index on public.sessions (status);
create index on public.sessions (ranking_merge_group_id) where ranking_merge_group_id is not null;
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
create index on public.teams (club_id, archived_at);
create index on public.routine_music (team_id, competition_id);
create index on public.ranking_merge_groups (competition_id);

-- ─── Functions ────────────────────────────────────────────────────────────────

set check_function_bodies = off;

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user: auto-create profile + entity on sign-up / invite accept
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
    values (v_profile_id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'club_name', new.raw_user_meta_data->>'phone')
    on conflict (id) do nothing;

  elsif v_role = 'judge' then
    insert into public.profiles (id, auth_id, email, role)
    values (v_profile_id, new.id, new.email, v_role::public.user_role);
    insert into public.judges (id, full_name, licence, phone, sport_type)
    values (v_profile_id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'licence', new.raw_user_meta_data->>'phone', coalesce(new.raw_user_meta_data->>'sport_type', 'acro'))
    on conflict (id) do nothing;

  elsif v_role = 'club' then
    v_pending_profile_id := (new.raw_user_meta_data->>'pending_profile_id')::uuid;
    if v_pending_profile_id is not null then
      update public.profiles set auth_id = new.id where id = v_pending_profile_id;
    else
      v_club_id := gen_random_uuid();
      insert into public.clubs (id, club_name, contact_name, phone)
      values (v_club_id, coalesce(new.raw_user_meta_data->>'club_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'contact_name', new.raw_user_meta_data->>'phone')
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

-- assign_dorsal: auto-assign sequential dorsal per competition on entry insert
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

-- handle_ts_upload: reset TS review status when a new TS is uploaded
create or replace function public.handle_ts_upload()
returns trigger language plpgsql security definer as $$
begin
  if new.ts_path is distinct from old.ts_path and new.ts_path is not null then
    update public.ts_review_status
    set status = 'new_ts', dj1_id = null, dj1_decision = null, dj1_comment = null,
        dj1_at = null, dj2_id = null, dj2_decision = null, dj2_comment = null,
        dj2_at = null, final_comment = null, notified_at = null
    where team_id = new.team_id
      and competition_id = new.competition_id
      and routine_type = new.routine_type
      and status in ('incorrect', 'checked');
  end if;
  return new;
end;
$$;

create trigger on_ts_upload
  after update on public.routine_music
  for each row execute function public.handle_ts_upload();

reset check_function_bodies;

-- ─── updated_at triggers ──────────────────────────────────────────────────────

create trigger trg_profiles_updated_at          before update on public.profiles          for each row execute function public.update_updated_at();
create trigger trg_competitions_updated_at       before update on public.competitions       for each row execute function public.update_updated_at();
create trigger trg_scores_updated_at             before update on public.scores             for each row execute function public.update_updated_at();
create trigger trg_routine_results_updated_at    before update on public.routine_results    for each row execute function public.update_updated_at();
create trigger trg_provisional_entries_updated_at before update on public.provisional_entries for each row execute function public.update_updated_at();
create trigger trg_definitive_entries_updated_at before update on public.definitive_entries  for each row execute function public.update_updated_at();
create trigger trg_ranking_merge_groups_updated_at before update on public.ranking_merge_groups for each row execute function public.update_updated_at();

-- ─── Storage buckets ──────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public) values
  ('judge-photos',       'judge-photos',       true),
  ('admin-avatars',      'admin-avatars',       true),
  ('gymnasts-photos',    'gymnasts-photos',     true),
  ('gymnast-licencias',  'gymnast-licencias',   false),
  ('coaches-photos',     'coaches-photos',      true),
  ('competition-posters','competition-posters', true),
  ('payment-documents',  'payment-documents',   false),
  ('tv-sponsor-videos',  'tv-sponsor-videos',   true)
on conflict (id) do nothing;

-- payment-documents: club upload/read own, admin read all
create policy "clubs_upload_payment_docs"    on storage.objects for insert to authenticated with check (bucket_id = 'payment-documents' and (storage.foldername(name))[2] = get_my_club_id()::text);
create policy "clubs_read_payment_docs"      on storage.objects for select to authenticated using  (bucket_id = 'payment-documents' and (storage.foldername(name))[2] = get_my_club_id()::text);
create policy "clubs_update_payment_docs"    on storage.objects for update to authenticated using  (bucket_id = 'payment-documents' and (storage.foldername(name))[2] = get_my_club_id()::text) with check (bucket_id = 'payment-documents' and (storage.foldername(name))[2] = get_my_club_id()::text);
create policy "admins_read_payment_docs"     on storage.objects for select to authenticated using  (bucket_id = 'payment-documents' and get_my_role() in ('admin','super_admin'));
create policy "comp_admin_read_payment_docs" on storage.objects for select to authenticated using  (bucket_id = 'payment-documents' and is_competition_admin((storage.foldername(name))[1]::uuid));

-- tv-sponsor-videos: public read, admin/comp-admin write
create policy "tv_sponsor_videos_select" on storage.objects for select to public      using  (bucket_id = 'tv-sponsor-videos');
create policy "tv_sponsor_videos_insert" on storage.objects for insert to authenticated with check (bucket_id = 'tv-sponsor-videos' and (get_my_role() in ('super_admin','admin') or is_competition_admin((storage.foldername(name))[1]::uuid)));
create policy "tv_sponsor_videos_update" on storage.objects for update to authenticated using  (bucket_id = 'tv-sponsor-videos' and (get_my_role() in ('super_admin','admin') or is_competition_admin((storage.foldername(name))[1]::uuid))) with check (bucket_id = 'tv-sponsor-videos' and (get_my_role() in ('super_admin','admin') or is_competition_admin((storage.foldername(name))[1]::uuid)));
create policy "tv_sponsor_videos_delete" on storage.objects for delete to authenticated using  (bucket_id = 'tv-sponsor-videos' and (get_my_role() in ('super_admin','admin') or is_competition_admin((storage.foldername(name))[1]::uuid)));

-- ─── Realtime ─────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.tv_state;
alter publication supabase_realtime add table public.section_practice_state;

-- ─── Seed data: apparatus ─────────────────────────────────────────────────────

insert into public.apparatus (name, name_es, sort_order) values
  ('Free',   'Manos libres', 1),
  ('Hoop',   'Aro',          2),
  ('Ball',   'Pelota',       3),
  ('Clubs',  'Mazas',        4),
  ('Ribbon', 'Cinta',        5),
  ('Rope',   'Cuerda',       6)
on conflict (name) do nothing;

-- ─── Seed data: Acro age groups (final normalised state) ─────────────────────
-- sport_type='acro'. Level column uses: FIG / Nacional / Base / Escolar

insert into public.age_group_rules (age_group, level, ruleset, routine_count, min_age, max_age, sort_order, sport_type) values
  -- FIG
  ('Senior',    'FIG',      'FIG',  3, 15, null, 1,  'acro'),
  ('Junior',    'FIG',      'FIG',  3, 13,   19, 2,  'acro'),
  ('Youth',     'FIG',      'FIG',  3, 12,   18, 3,  'acro'),
  ('Pre-Youth', 'FIG',      'FIG',  2, 11,   16, 4,  'acro'),
  -- RFEG Nacional
  ('Senior',    'Nacional', 'RFEG', 3, 12, null, 5,  'acro'),
  ('Junior',    'Nacional', 'RFEG', 3, 11,   19, 6,  'acro'),
  ('Youth',     'Nacional', 'RFEG', 3, 10,   18, 7,  'acro'),
  ('Pre-Youth', 'Nacional', 'RFEG', 2,  9,   11, 8,  'acro'),
  ('Cadete',    'Nacional', 'RFEG', 1,  8,   15, 9,  'acro'),
  ('Infantil',  'Nacional', 'RFEG', 1,  8,   13, 10, 'acro'),
  ('Alevín',    'Nacional', 'RFEG', 1,  7,   12, 11, 'acro'),
  -- RFEG Base
  ('Senior',    'Base',     'RFEG', 2, 12, null, 12, 'acro'),
  ('Junior',    'Base',     'RFEG', 2, 10,   19, 13, 'acro'),
  ('Cadete',    'Base',     'RFEG', 1,  8,   16, 14, 'acro'),
  ('Infantil',  'Base',     'RFEG', 1,  8,   14, 15, 'acro'),
  ('Alevín',    'Base',     'RFEG', 1,  7,   13, 16, 'acro'),
  -- FGX Escolar
  ('Absoluto',  'Escolar',  'FGX',  1,  6, null, 17, 'acro'),
  ('Infantil',  'Escolar',  'FGX',  1,  7,   15, 18, 'acro'),
  ('Alevín',    'Escolar',  'FGX',  1,  6,   13, 19, 'acro'),
  ('Benxamín',  'Escolar',  'FGX',  1,  6,   11, 20, 'acro')
on conflict (age_group, level, ruleset) do nothing;

-- ─── RG seed data ─────────────────────────────────────────────────────────────
-- Run these migration files separately for full RG support:
--   supabase/migrations/20260501000000_age_groups_rg.sql
--   supabase/migrations/20260501000001_rg_apparatus_rules.sql
--   supabase/migrations/20260508000000_age_group_level.sql
--
-- NOTE: the age_group_level migration uses hardcoded UUIDs for 3 "Juvenil Base"
-- rows. On a fresh DB those rows will be inserted with different UUIDs; manually
-- update those 3 rows after running the migration, OR insert them directly:
--
-- insert into public.age_group_rules (age_group, level, ruleset, routine_count, min_age, max_age, sort_order, sport_type) values
--   ('Juvenil (2010-2009)', 'Base', 'Individual', 0, 16, 17, 98, 'rg'),
--   ('Juvenil (2008-2007)', 'Base', 'Individual', 0, 18, 19, 99, 'rg'),
--   ('Juvenil (2006+)',     'Base', 'Individual', 0, 20, null, 100, 'rg')
-- on conflict (age_group, level, ruleset) do nothing;

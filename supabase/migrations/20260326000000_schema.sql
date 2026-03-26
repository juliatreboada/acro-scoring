-- ─────────────────────────────────────────────────────────────────────────────
-- ACRO SCORING — Schema
-- Every entity (judge, club, admin) extends profiles:
--   entity.id = profiles.id = auth.users.id
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extensions ───────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type public.user_role as enum (
  'super_admin',  -- full system access
  'admin',        -- competition admin: manages assigned competitions
  'judge',        -- submits scores in assigned sessions
  'club'          -- manages gymnasts, teams, registrations
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

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by handle_new_user trigger.

create table public.profiles (
  id         uuid               primary key references auth.users(id) on delete cascade,
  email      text,
  role       public.user_role   not null,
  created_at timestamptz        not null default now(),
  updated_at timestamptz        not null default now()
);

-- ─── admins ───────────────────────────────────────────────────────────────────
-- super_admin and admin users. id = profiles.id = auth.users.id.

create table public.admins (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  club_name  text,
  phone      text,
  avatar_url text
);

-- ─── judges ───────────────────────────────────────────────────────────────────
-- id = profiles.id = auth.users.id.

create table public.judges (
  id         uuid primary key references public.profiles(id) on delete cascade,
  full_name  text not null,
  licence    text,
  phone      text,
  avatar_url text
);

-- ─── clubs ────────────────────────────────────────────────────────────────────
-- One login per club. id = profiles.id = auth.users.id.

create table public.clubs (
  id           uuid primary key references public.profiles(id) on delete cascade,
  club_name    text not null,
  contact_name text,
  phone        text,
  avatar_url   text
);

-- ─── age_group_rules ──────────────────────────────────────────────────────────

create table public.age_group_rules (
  id            uuid     primary key default uuid_generate_v4(),
  age_group     text     not null,         -- display name: "Senior", "Senior Base", "Alevín Escolar"
  ruleset       text     not null,         -- "FIG" | "RFEG" | "FGX"
  routine_count smallint not null default 1,
  min_age       integer  not null,
  max_age       integer,                   -- null = no upper limit
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
  created_at    timestamptz not null default now()
);

-- ─── teams ────────────────────────────────────────────────────────────────────

create table public.teams (
  id              uuid        primary key default uuid_generate_v4(),
  club_id         uuid        not null references public.clubs(id) on delete cascade,
  category        text        not null,   -- e.g. "Women's Pair"
  age_group       text        not null,   -- e.g. "Junior FIG"
  gymnast_display text        not null,   -- denormalised display string
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
  id                    uuid                       primary key default uuid_generate_v4(),
  name                  text                       not null,
  status                public.competition_status  not null default 'draft',
  location              text,
  start_date            date,
  end_date              date,
  registration_deadline date,
  age_groups            text[]                     not null default '{}',
  poster_url            text,
  admin_id              uuid                       references public.admins(id) on delete set null,
  created_by            uuid                       references public.admins(id) on delete set null,
  created_at            timestamptz                not null default now(),
  updated_at            timestamptz                not null default now()
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
  id             uuid     primary key default uuid_generate_v4(),
  competition_id uuid     not null references public.competitions(id) on delete cascade,
  section_number smallint not null,
  label          text,
  unique (competition_id, section_number)
);

-- ─── sessions ─────────────────────────────────────────────────────────────────

create table public.sessions (
  id              uuid                   primary key default uuid_generate_v4(),
  competition_id  uuid                   not null references public.competitions(id) on delete cascade,
  panel_id        uuid                   not null references public.panels(id)       on delete cascade,
  section_id      uuid                   not null references public.sections(id)     on delete cascade,
  name            text                   not null,
  age_group       text                   not null,
  category        text                   not null,
  routine_type    public.routine_type    not null,
  status          public.session_status  not null default 'waiting',
  order_index     smallint               not null default 1,
  order_locked    boolean                not null default false,
  current_team_id uuid                   references public.teams(id) on delete set null
);

-- ─── competition_entries ──────────────────────────────────────────────────────

create table public.competition_entries (
  id             uuid        primary key default uuid_generate_v4(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  team_id        uuid        not null references public.teams(id)        on delete cascade,
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
  id          uuid                primary key default uuid_generate_v4(),
  section_id  uuid                not null references public.sections(id) on delete cascade,
  panel_id    uuid                not null references public.panels(id)   on delete cascade,
  judge_id    uuid                references public.judges(id)            on delete set null,
  role        public.judge_role   not null,
  role_number smallint            not null default 1
);

-- ─── routine_music ────────────────────────────────────────────────────────────

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
  submitted_at           timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (session_id, team_id, section_panel_judge_id)
);

-- ─── routine_results ──────────────────────────────────────────────────────────

create table public.routine_results (
  id          uuid                 primary key default uuid_generate_v4(),
  session_id  uuid                 not null references public.sessions(id) on delete cascade,
  team_id     uuid                 not null references public.teams(id)    on delete cascade,
  e_score     numeric(5,3),
  a_score     numeric(5,3),
  dif_score   numeric(5,2),
  dif_penalty numeric(4,1),
  cjp_penalty numeric(4,1),
  final_score numeric(6,3),
  status      public.result_status not null default 'provisional',
  approved_by uuid                 references public.judges(id) on delete set null,
  approved_at timestamptz,
  created_at  timestamptz          not null default now(),
  updated_at  timestamptz          not null default now(),
  unique (session_id, team_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

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
create index on public.teams (club_id);
create index on public.routine_music (team_id, competition_id);

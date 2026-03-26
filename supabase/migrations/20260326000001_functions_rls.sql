-- ─────────────────────────────────────────────────────────────────────────────
-- ACRO SCORING — Functions, Triggers & RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── updated_at trigger ───────────────────────────────────────────────────────

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

-- ─── Helper: current user's role ──────────────────────────────────────────────
-- Returns text (not the enum) to avoid operator resolution issues in RLS policies.

create or replace function public.get_my_role()
returns text language sql stable security definer
set search_path = '' as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- ─── Helper: current club id ──────────────────────────────────────────────────
-- For club users, auth.uid() IS their clubs.id. Returns null for all other roles.

create or replace function public.get_my_club_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select case
    when (select role::text from public.profiles where id = auth.uid()) = 'club'
    then auth.uid()
    else null
  end
$$;

-- ─── Helper: current judge id ─────────────────────────────────────────────────
-- For judge users, auth.uid() IS their judges.id. Returns null for all other roles.

create or replace function public.get_my_judge_id()
returns uuid language sql stable security definer
set search_path = '' as $$
  select case
    when (select role::text from public.profiles where id = auth.uid()) = 'judge'
    then auth.uid()
    else null
  end
$$;

-- ─── Helper: is current user the admin of a competition ───────────────────────

create or replace function public.is_competition_admin(p_competition_id uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.competitions
    where id = p_competition_id
      and admin_id = auth.uid()
  )
$$;

-- ─── Helper: is current judge assigned to a session ───────────────────────────
-- A judge is assigned when they have a slot in section_panel_judges that
-- matches the session's panel_id + section_id.

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

-- ─── Trigger: auto-create profile + entity on sign-up / invite accept ─────────
-- Invite metadata by role:
--   super_admin / admin : { role, full_name, club_name?, phone? }
--   judge               : { role, full_name, licence?, phone? }
--   club                : { role, club_name, contact_name?, phone? }

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'judge');

  insert into public.profiles (id, email, role)
  values (new.id, new.email, v_role::public.user_role)
  on conflict (id) do nothing;

  if v_role in ('admin', 'super_admin') then
    insert into public.admins (id, full_name, club_name, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'club_name',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

  elsif v_role = 'judge' then
    insert into public.judges (id, full_name, licence, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'licence',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

  elsif v_role = 'club' then
    insert into public.clubs (id, club_name, contact_name, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'club_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'contact_name',
      new.raw_user_meta_data->>'phone'
    )
    on conflict (id) do nothing;

  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── profiles ─────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for select using (id = auth.uid());

create policy "profiles: admins read all" on public.profiles
  for select using (get_my_role() in ('super_admin', 'admin'));

create policy "profiles: own update" on public.profiles
  for update using (id = auth.uid());

-- ─── admins ───────────────────────────────────────────────────────────────────

alter table public.admins enable row level security;

create policy "admins: own row" on public.admins
  for select using (id = auth.uid());

-- Authenticated users can read admin names (shown on competition pages)
create policy "admins: auth read" on public.admins
  for select using (auth.role() = 'authenticated');

create policy "admins: super_admin all" on public.admins
  for all using (get_my_role() = 'super_admin');

create policy "admins: own update" on public.admins
  for update using (id = auth.uid());

-- ─── judges ───────────────────────────────────────────────────────────────────

alter table public.judges enable row level security;

-- All authenticated users can read judges (needed for assignment dropdowns)
create policy "judges: authenticated read" on public.judges
  for select using (auth.role() = 'authenticated');

create policy "judges: super_admin all" on public.judges
  for all using (get_my_role() = 'super_admin');

create policy "judges: own update" on public.judges
  for update using (id = auth.uid());

-- ─── clubs ────────────────────────────────────────────────────────────────────

alter table public.clubs enable row level security;

-- Club names appear on public pages (starting order, results)
create policy "clubs: public read" on public.clubs
  for select using (true);

create policy "clubs: super_admin all" on public.clubs
  for all using (get_my_role() = 'super_admin');

-- A club user manages their own record
create policy "clubs: own all" on public.clubs
  for all using (id = auth.uid());

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
    and admin_id = auth.uid()
  );

create policy "competitions: admin update own" on public.competitions
  for update using (
    get_my_role() = 'admin'
    and admin_id = auth.uid()
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

-- CJP updates session status (open/close performances) and current_team_id
create policy "sessions: cjp update assigned" on public.sessions
  for update using (is_judge_assigned_to_session(id));

-- ─── competition_judge_nominations ────────────────────────────────────────────

alter table public.competition_judge_nominations enable row level security;

create policy "nominations: super_admin all" on public.competition_judge_nominations
  for all using (get_my_role() = 'super_admin');

create policy "nominations: admin read own" on public.competition_judge_nominations
  for select using (
    get_my_role() = 'admin'
    and is_competition_admin(competition_id)
  );

-- A club manages their own judge nominations
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

-- Public read when the starting order is published (order_locked = true)
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
      select id from public.section_panel_judges
      where judge_id = get_my_judge_id()
    )
  )
  with check (
    section_panel_judge_id in (
      select id from public.section_panel_judges
      where judge_id = get_my_judge_id()
    )
  );

-- ─── routine_results ──────────────────────────────────────────────────────────

alter table public.routine_results enable row level security;

-- Public read for approved results (live results page)
create policy "results: public read approved" on public.routine_results
  for select using (status = 'approved');

-- Authenticated users see provisional results too (judges/admins in-progress view)
create policy "results: auth read all" on public.routine_results
  for select using (auth.role() = 'authenticated');

-- CJP submits and updates results for their assigned sessions
create policy "results: cjp insert" on public.routine_results
  for insert with check (is_judge_assigned_to_session(session_id));

create policy "results: cjp update" on public.routine_results
  for update
  using (is_judge_assigned_to_session(session_id))
  with check (is_judge_assigned_to_session(session_id));

create policy "results: super_admin all" on public.routine_results
  for all using (get_my_role() = 'super_admin');

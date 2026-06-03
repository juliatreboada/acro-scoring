-- T-shirt collection for competition participants
alter table public.competitions
  add column if not exists tshirt_sizes    text[]  not null default '{}',
  add column if not exists tshirt_deadline date;

create table if not exists public.tshirt_orders (
  id             uuid        primary key default gen_random_uuid(),
  competition_id uuid        not null references public.competitions(id) on delete cascade,
  person_type    text        not null check (person_type in ('gymnast', 'coach')),
  person_id      uuid        not null,
  size           text        not null,
  updated_at     timestamptz not null default now(),
  unique (competition_id, person_type, person_id)
);

alter table public.tshirt_orders enable row level security;

-- Admins can do everything
create policy "tshirt_orders_admin"
  on public.tshirt_orders for all
  using  (is_competition_admin(competition_id))
  with check (is_competition_admin(competition_id));

-- Clubs read/write their own people's orders
create policy "tshirt_orders_club_select"
  on public.tshirt_orders for select
  using (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id()))
    )
  );

create policy "tshirt_orders_club_insert"
  on public.tshirt_orders for insert
  with check (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id()))
    )
  );

create policy "tshirt_orders_club_update"
  on public.tshirt_orders for update
  using (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id()))
    )
  );

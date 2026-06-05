-- Meals feature: per-competition meal offers that clubs can order and pay for.
-- Requires a Supabase Storage bucket named "meal-payments" (public read, auth write).

alter table public.competitions
  add column if not exists meals_enabled boolean not null default false;

-- Admin-defined meal options (grouped by day_label + meal_type in the UI)
create table if not exists public.meal_options (
  id             uuid         primary key default gen_random_uuid(),
  competition_id uuid         not null references public.competitions(id) on delete cascade,
  day_label      text         not null,
  meal_type      text         not null check (meal_type in ('lunch', 'dinner')),
  name           text         not null,
  description    text,
  price          numeric(8,2) not null default 0,
  sort_order     int          not null default 0,
  created_at     timestamptz  not null default now()
);

alter table public.meal_options enable row level security;

create policy "meal_options_admin"
  on public.meal_options for all
  using  (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'))
  with check (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

create policy "meal_options_read"
  on public.meal_options for select
  using (true);

-- Per-club quantity selections (one row per option per club)
create table if not exists public.meal_orders (
  id             uuid         primary key default gen_random_uuid(),
  competition_id uuid         not null references public.competitions(id) on delete cascade,
  club_id        uuid         not null references public.clubs(id) on delete cascade,
  meal_option_id uuid         not null references public.meal_options(id) on delete cascade,
  quantity       int          not null default 0 check (quantity >= 0),
  unique (club_id, meal_option_id)
);

alter table public.meal_orders enable row level security;

create policy "meal_orders_admin"
  on public.meal_orders for all
  using  (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'))
  with check (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

create policy "meal_orders_club"
  on public.meal_orders for all
  using  (get_my_role() = 'club' and club_id = get_my_club_id())
  with check (get_my_role() = 'club' and club_id = get_my_club_id());

-- Per-club submission + payment status
create table if not exists public.meal_submissions (
  id                uuid         primary key default gen_random_uuid(),
  competition_id    uuid         not null references public.competitions(id) on delete cascade,
  club_id           uuid         not null references public.clubs(id) on delete cascade,
  status            text         not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'rejected')),
  payment_proof_url text,
  total_amount      numeric(8,2),
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  admin_notes       text,
  unique (competition_id, club_id)
);

alter table public.meal_submissions enable row level security;

create policy "meal_submissions_admin"
  on public.meal_submissions for all
  using  (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'))
  with check (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

create policy "meal_submissions_club"
  on public.meal_submissions for all
  using  (get_my_role() = 'club' and club_id = get_my_club_id())
  with check (get_my_role() = 'club' and club_id = get_my_club_id());

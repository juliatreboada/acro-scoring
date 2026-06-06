create table if not exists public.meal_categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text    not null,
  sort_order integer not null default 0
);

insert into public.meal_categories (name, sort_order) values
  ('Primer plato', 0),
  ('Segundo plato', 1),
  ('Postre', 2),
  ('Bebida', 3);

alter table public.meal_categories enable row level security;

create policy "meal_categories: public read" on public.meal_categories
  for select using (true);

create policy "meal_categories: super_admin all" on public.meal_categories
  for all using (get_my_role() = 'super_admin');

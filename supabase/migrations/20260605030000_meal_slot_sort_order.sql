alter table public.meal_options
  add column if not exists slot_sort_order integer not null default 0;

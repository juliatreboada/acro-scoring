alter table public.meal_options
  add column if not exists course_sort_order integer not null default 0;

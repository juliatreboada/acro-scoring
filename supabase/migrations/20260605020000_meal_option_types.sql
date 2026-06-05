-- Optional sub-options (types) within a meal item.
-- E.g. item "Fruit" can have types "Apple" and "Orange".
-- When a parent has children the club selects from the children;
-- when it has none, the club selects the parent directly.
alter table public.meal_options
  add column if not exists parent_option_id uuid
    references public.meal_options(id) on delete cascade;

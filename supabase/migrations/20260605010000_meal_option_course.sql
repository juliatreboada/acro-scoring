-- Optional sub-grouping within a meal slot.
-- When set, options within a slot are grouped under this heading
-- (e.g. "Primer plato", "Postre", "Bebida").
-- When null the option is a standalone complete-menu item (original behaviour).
alter table public.meal_options
  add column if not exists course_label text;

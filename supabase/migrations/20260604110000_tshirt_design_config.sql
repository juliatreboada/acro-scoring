alter table public.competitions
  add column if not exists tshirt_design_config jsonb;

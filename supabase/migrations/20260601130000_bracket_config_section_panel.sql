-- Add section and panel references to open/combinados bracket config so the
-- system knows where to auto-create advancement sessions (Quarter-Finals, etc.)
alter table public.open_combinados_bracket_config
  add column if not exists bracket_section_id uuid references public.sections(id) on delete set null,
  add column if not exists bracket_panel_id   uuid references public.panels(id)   on delete set null;

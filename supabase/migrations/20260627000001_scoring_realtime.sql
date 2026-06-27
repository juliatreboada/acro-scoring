-- Enable Realtime for judge scoring tables so panels and TV update without reload.
-- Idempotent: skip tables already in the publication (e.g. added manually in dashboard).

do $$
declare
  t text;
begin
  foreach t in array array['scores', 'routine_results', 'sessions']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

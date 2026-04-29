-- Allow anonymous access to age_group_rules so the TV page (unauthenticated)
-- can resolve age group display names.
create policy "age_group_rules public read"
  on public.age_group_rules
  for select
  using (true);

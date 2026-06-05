-- tshirt_orders_admin policy was missing super_admin/admin coverage.
-- super_admin users saw zero rows because is_competition_admin() only
-- matches the specific admin_id of the competition, not super_admin role.
drop policy if exists "tshirt_orders_admin" on public.tshirt_orders;

create policy "tshirt_orders_admin"
  on public.tshirt_orders for all
  using  (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'))
  with check (is_competition_admin(competition_id) or get_my_role() in ('super_admin', 'admin'));

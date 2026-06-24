-- Fix: is_competition_admin alone doesn't cover super_admin/admin roles
DROP POLICY IF EXISTS "Admins can manage competition staff" ON public.competition_staff;

CREATE POLICY "Admins can manage competition staff"
  ON public.competition_staff
  FOR ALL
  USING  (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'));

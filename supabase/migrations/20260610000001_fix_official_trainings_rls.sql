-- is_competition_admin() only matches the specific admin_id on the competition row,
-- not super_admin or admin roles. Drop and recreate policies with the role fallback.

DROP POLICY IF EXISTS "admin_all_official_trainings"        ON public.official_trainings;
DROP POLICY IF EXISTS "admin_all_official_training_entries" ON public.official_training_entries;

CREATE POLICY "admin_all_official_trainings" ON public.official_trainings
  FOR ALL TO authenticated
  USING  (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (is_competition_admin(competition_id) OR get_my_role() IN ('super_admin', 'admin'));

CREATE POLICY "admin_all_official_training_entries" ON public.official_training_entries
  FOR ALL TO authenticated
  USING (
    get_my_role() IN ('super_admin', 'admin')
    OR is_competition_admin(
      (SELECT competition_id FROM public.official_trainings WHERE id = training_id)
    )
  )
  WITH CHECK (
    get_my_role() IN ('super_admin', 'admin')
    OR is_competition_admin(
      (SELECT competition_id FROM public.official_trainings WHERE id = training_id)
    )
  );

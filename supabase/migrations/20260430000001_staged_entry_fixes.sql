-- ── updated_at triggers for staged entry tables ───────────────────────────────

create trigger trg_provisional_entries_updated_at
  before update on public.provisional_entries
  for each row execute function public.update_updated_at();

create trigger trg_definitive_entries_updated_at
  before update on public.definitive_entries
  for each row execute function public.update_updated_at();

-- ── storage: allow clubs to replace (upsert) their payment document ───────────
-- Supabase storage upsert:true issues an UPDATE when the file already exists,
-- which requires an explicit UPDATE policy on storage.objects.

create policy "clubs_update_payment_docs" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'payment-documents'
    AND (storage.foldername(name))[2] = get_my_club_id()::text
  )
  with check (
    bucket_id = 'payment-documents'
    AND (storage.foldername(name))[2] = get_my_club_id()::text
  );

-- ── storage: comp-admin can read payment docs for their competition ────────────
-- The existing admins_read_payment_docs only covers admin/super_admin by role.
-- is_competition_admin covers comp-admin users assigned to a specific competition.
-- We can't filter by competition_id from the file path alone (would need a join),
-- so we grant read to any is_competition_admin — acceptable since payment docs
-- are internal administrative files, not public.

create policy "comp_admin_read_payment_docs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-documents'
    AND is_competition_admin(
      (storage.foldername(name))[1]::uuid
    )
  );

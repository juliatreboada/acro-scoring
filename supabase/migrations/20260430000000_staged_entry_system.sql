-- ── Step 1: add new competition status enum values ───────────────────────────
ALTER TYPE public.competition_status ADD VALUE IF NOT EXISTS 'provisional_entry' AFTER 'draft';
ALTER TYPE public.competition_status ADD VALUE IF NOT EXISTS 'definitive_entry'  AFTER 'provisional_entry';

-- ── Step 2: add fee columns to competitions ───────────────────────────────────
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS fee_per_team     numeric NULL,
  ADD COLUMN IF NOT EXISTS fee_per_gymnast  numeric NULL,
  ADD COLUMN IF NOT EXISTS judge_missing_fine numeric NULL;

-- ── Step 3: provisional_entries ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.provisional_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  club_id         uuid NOT NULL REFERENCES public.clubs(id)        ON DELETE CASCADE,
  teams_per_category jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, club_id)
);

ALTER TABLE public.provisional_entries ENABLE ROW LEVEL SECURITY;

-- clubs can read/insert/update their own row
CREATE POLICY "clubs_own_provisional" ON public.provisional_entries
  FOR ALL TO authenticated
  USING (club_id = get_my_club_id())
  WITH CHECK (club_id = get_my_club_id());

-- admins can read all
CREATE POLICY "admins_read_provisional" ON public.provisional_entries
  FOR SELECT TO authenticated
  USING (is_competition_admin(competition_id) OR get_my_role() IN ('admin', 'super_admin'));

-- ── Step 4: definitive_entries ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.definitive_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  club_id         uuid NOT NULL REFERENCES public.clubs(id)        ON DELETE CASCADE,
  contact_name    text NOT NULL DEFAULT '',
  contact_phone   text NOT NULL DEFAULT '',
  contact_email   text NOT NULL DEFAULT '',
  teams_per_category jsonb NOT NULL DEFAULT '{}',
  judge_name      text NULL,
  total_amount    numeric NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'payment_uploaded', 'approved', 'rejected')),
  payment_document_url text NULL,
  admin_notes     text NULL,
  reviewed_at     timestamptz NULL,
  reviewed_by     uuid NULL REFERENCES public.admins(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, club_id)
);

ALTER TABLE public.definitive_entries ENABLE ROW LEVEL SECURITY;

-- clubs can read/insert their own row
CREATE POLICY "clubs_read_own_definitive" ON public.definitive_entries
  FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

CREATE POLICY "clubs_insert_definitive" ON public.definitive_entries
  FOR INSERT TO authenticated
  WITH CHECK (club_id = get_my_club_id());

-- clubs can update only their own row (for uploading payment proof)
CREATE POLICY "clubs_update_definitive" ON public.definitive_entries
  FOR UPDATE TO authenticated
  USING (club_id = get_my_club_id())
  WITH CHECK (club_id = get_my_club_id());

-- admins can read all and update status
CREATE POLICY "admins_manage_definitive" ON public.definitive_entries
  FOR ALL TO authenticated
  USING (is_competition_admin(competition_id) OR get_my_role() IN ('admin', 'super_admin'));

-- ── Step 5: competition_allowed_clubs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competition_allowed_clubs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  club_id         uuid NOT NULL REFERENCES public.clubs(id)        ON DELETE CASCADE,
  source          text NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('definitive_entry', 'manual')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, club_id)
);

ALTER TABLE public.competition_allowed_clubs ENABLE ROW LEVEL SECURITY;

-- admins full control
CREATE POLICY "admins_manage_allowed_clubs" ON public.competition_allowed_clubs
  FOR ALL TO authenticated
  USING (is_competition_admin(competition_id) OR get_my_role() IN ('admin', 'super_admin'));

-- clubs can read their own row (to check if they are allowed)
CREATE POLICY "clubs_read_own_allowed" ON public.competition_allowed_clubs
  FOR SELECT TO authenticated
  USING (club_id = get_my_club_id());

-- anonymous read (gate check from club portal uses anon key in some paths)
CREATE POLICY "anon_read_allowed_clubs" ON public.competition_allowed_clubs
  FOR SELECT TO anon
  USING (true);

-- ── Step 6: storage bucket for payment documents ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-documents', 'payment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- clubs can upload to their own folder
CREATE POLICY "clubs_upload_payment_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-documents'
    AND (storage.foldername(name))[2] = get_my_club_id()::text
  );

-- clubs can read their own files
CREATE POLICY "clubs_read_payment_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-documents'
    AND (storage.foldername(name))[2] = get_my_club_id()::text
  );

-- admins can read all payment documents
CREATE POLICY "admins_read_payment_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-documents'
    AND get_my_role() IN ('admin', 'super_admin')
  );

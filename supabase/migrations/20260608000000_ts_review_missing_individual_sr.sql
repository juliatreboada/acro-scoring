ALTER TABLE public.ts_review_status
  ADD COLUMN IF NOT EXISTS missing_individual_sr boolean NOT NULL DEFAULT false;

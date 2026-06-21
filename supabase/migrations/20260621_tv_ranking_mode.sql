ALTER TABLE public.tv_state
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'score',
  ADD COLUMN IF NOT EXISTS ranking_config jsonb;

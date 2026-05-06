-- Add db_score column to scores table for RG DB judge
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS db_score numeric;

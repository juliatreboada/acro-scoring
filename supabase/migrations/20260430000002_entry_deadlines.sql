ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS provisional_entry_deadline date NULL,
  ADD COLUMN IF NOT EXISTS definitive_entry_deadline  date NULL;

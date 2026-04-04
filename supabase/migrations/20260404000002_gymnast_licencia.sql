-- Add licencia (competition licence PDF) field to gymnasts.
-- The file is stored in the 'gymnast-licencias' Supabase storage bucket.
-- Note: create the storage bucket manually in the Supabase dashboard if it does not exist yet.

alter table public.gymnasts
  add column if not exists licencia_url text;

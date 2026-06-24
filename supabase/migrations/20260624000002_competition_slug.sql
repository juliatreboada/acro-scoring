CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS slug text;

-- Backfill: name-year, lower, no accents, non-alphanum → hyphen, trim hyphens
UPDATE public.competitions
SET slug = trim(both '-' from regexp_replace(
  lower(unaccent(name || '-' || EXTRACT(YEAR FROM start_date)::text)),
  '[^a-z0-9]+', '-', 'g'
));

ALTER TABLE public.competitions ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS competitions_slug_key ON public.competitions(slug);

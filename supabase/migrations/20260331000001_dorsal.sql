-- Add dorsal column to competition_entries
ALTER TABLE public.competition_entries
  ADD COLUMN IF NOT EXISTS dorsal integer;

-- Auto-assign sequential dorsal per competition on insert
CREATE OR REPLACE FUNCTION public.assign_dorsal()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT COALESCE(MAX(dorsal), 0) + 1
    INTO NEW.dorsal
    FROM public.competition_entries
   WHERE competition_id = NEW.competition_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_dorsal ON public.competition_entries;
CREATE TRIGGER trg_assign_dorsal
  BEFORE INSERT ON public.competition_entries
  FOR EACH ROW EXECUTE FUNCTION public.assign_dorsal();

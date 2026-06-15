-- legs_together: balance elements performed with legs together get +1 bonus
-- DJ can toggle this off if the element was not performed with legs together
ALTER TABLE public.ts_elements
  ADD COLUMN IF NOT EXISTS legs_together boolean NOT NULL DEFAULT false;

-- Add 'published' status between registration_closed and active.
-- Competitions in this status have a publicly visible starting order but have not yet begun.
alter type public.competition_status add value if not exists 'published' after 'registration_closed';

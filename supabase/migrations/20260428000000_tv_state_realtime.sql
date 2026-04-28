-- Enable Realtime broadcasts for tv_state so the TV scoreboard
-- and admin preview update instantly without a page reload.
alter publication supabase_realtime add table public.tv_state;

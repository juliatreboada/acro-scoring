-- Soft-archive club teams: row stays for competition_entries / session_orders / scores, etc.
alter table public.teams
  add column if not exists archived_at timestamptz null;

comment on column public.teams.archived_at is
  'When set, club roster hides this team; FKs to teams.id remain for competitions.';

create index if not exists teams_club_id_archived_at_idx
  on public.teams (club_id, archived_at);

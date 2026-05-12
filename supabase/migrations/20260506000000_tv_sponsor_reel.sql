-- Sponsor video playlist for public TV (loop; pauses while team/scores are queued).

alter table public.competitions
  add column if not exists tv_sponsor_videos jsonb not null default '[]'::jsonb;

alter table public.tv_state
  add column if not exists sponsor_reel_enabled boolean not null default false,
  add column if not exists sponsor_playlist_index integer not null default 0;

comment on column public.competitions.tv_sponsor_videos is
  'Ordered sponsor clips for TV: [{ "id": string, "path": "compId/file.mp4", "label"?: string }] (storage paths in bucket tv-sponsor-videos).';

comment on column public.tv_state.sponsor_reel_enabled is
  'When true and no team is queued, TV plays sponsor playlist loop.';

comment on column public.tv_state.sponsor_playlist_index is
  'Zero-based index into competitions.tv_sponsor_videos for the next clip to play.';

-- Competition admins can drive TV state (same as other competition-scoped writes).
drop policy if exists "tv_state: competition admin write" on public.tv_state;
create policy "tv_state: competition admin write"
  on public.tv_state
  for all
  to authenticated
  using (public.is_competition_admin(competition_id))
  with check (public.is_competition_admin(competition_id));

-- Public read-only bucket for sponsor MP4s (TV page is anonymous).
insert into storage.buckets (id, name, public)
values ('tv-sponsor-videos', 'tv-sponsor-videos', true)
on conflict (id) do update set public = excluded.public;

-- Path layout: {competition_id}/{filename}
create policy "tv_sponsor_videos_select"
  on storage.objects
  for select
  to public
  using (bucket_id = 'tv-sponsor-videos');

create policy "tv_sponsor_videos_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'tv-sponsor-videos'
    and (
      get_my_role() in ('super_admin', 'admin')
      or public.is_competition_admin((storage.foldername(name))[1]::uuid)
    )
  );

create policy "tv_sponsor_videos_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'tv-sponsor-videos'
    and (
      get_my_role() in ('super_admin', 'admin')
      or public.is_competition_admin((storage.foldername(name))[1]::uuid)
    )
  )
  with check (
    bucket_id = 'tv-sponsor-videos'
    and (
      get_my_role() in ('super_admin', 'admin')
      or public.is_competition_admin((storage.foldername(name))[1]::uuid)
    )
  );

create policy "tv_sponsor_videos_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'tv-sponsor-videos'
    and (
      get_my_role() in ('super_admin', 'admin')
      or public.is_competition_admin((storage.foldername(name))[1]::uuid)
    )
  );

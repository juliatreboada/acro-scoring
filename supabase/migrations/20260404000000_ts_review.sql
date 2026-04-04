-- TS review status: tracks DJ review state per tariff sheet

create table public.ts_review_status (
  team_id        uuid                not null references public.teams(id)       on delete cascade,
  competition_id uuid                not null references public.competitions(id) on delete cascade,
  routine_type   public.routine_type not null,
  -- pending | awaiting_dj2 | checked | incorrect | new_ts
  status         text                not null default 'pending',
  -- First DJ to act
  dj1_id         uuid                references public.judges(id),
  dj1_decision   text,               -- 'checked' | 'incorrect'
  dj1_comment    text,
  dj1_at         timestamptz,
  -- Second DJ (confirms or overrides, 2-DJ panels only)
  dj2_id         uuid                references public.judges(id),
  dj2_decision   text,               -- 'checked' | 'incorrect'
  dj2_comment    text,
  dj2_at         timestamptz,
  -- Final comment sent to club (set when status transitions to 'incorrect')
  final_comment  text,
  notified_at    timestamptz,
  primary key (team_id, competition_id, routine_type)
);

alter table public.ts_review_status enable row level security;

-- DJs can read/write review statuses for sessions in their competitions
create policy "ts_review_status: dj all" on public.ts_review_status
  for all using (
    exists (
      select 1
      from public.section_panel_judges spj
      join public.sessions s
        on s.section_id = spj.section_id
       and s.panel_id   = spj.panel_id
      where spj.judge_id = auth.uid()
        and spj.role     = 'DJ'
        and s.competition_id = ts_review_status.competition_id
    )
  );

-- Clubs can read review statuses for their own teams
create policy "ts_review_status: club read" on public.ts_review_status
  for select using (
    exists (
      select 1 from public.teams t
      where t.id      = ts_review_status.team_id
        and t.club_id = auth.uid()
    )
  );

-- Admins can read all
create policy "ts_review_status: admin read" on public.ts_review_status
  for select using (get_my_role() in ('super_admin', 'admin'));

-- ── Trigger: club uploads new TS → reset review status to 'new_ts' ────────────

create or replace function public.handle_ts_upload()
returns trigger language plpgsql security definer as $$
begin
  if NEW.ts_path is distinct from OLD.ts_path and NEW.ts_path is not null then
    update public.ts_review_status
    set
      status        = 'new_ts',
      dj1_id        = null,
      dj1_decision  = null,
      dj1_comment   = null,
      dj1_at        = null,
      dj2_id        = null,
      dj2_decision  = null,
      dj2_comment   = null,
      dj2_at        = null,
      final_comment = null,
      notified_at   = null
    where team_id        = NEW.team_id
      and competition_id = NEW.competition_id
      and routine_type   = NEW.routine_type
      and status in ('incorrect', 'checked');
  end if;
  return NEW;
end;
$$;

create trigger on_ts_upload
  after update on public.routine_music
  for each row
  execute function public.handle_ts_upload();

-- Allow 'judge' as a valid person_type in tshirt_orders
alter table public.tshirt_orders
  drop constraint tshirt_orders_person_type_check,
  add  constraint tshirt_orders_person_type_check
    check (person_type in ('gymnast', 'coach', 'judge'));

-- Rebuild club RLS policies to include judge (nominated by that club for this competition)
drop policy if exists "tshirt_orders_club_select" on public.tshirt_orders;
drop policy if exists "tshirt_orders_club_insert" on public.tshirt_orders;
drop policy if exists "tshirt_orders_club_update" on public.tshirt_orders;

create policy "tshirt_orders_club_select"
  on public.tshirt_orders for select
  using (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id())) or
      (person_type = 'judge'   and exists (
        select 1 from public.competition_judge_nominations
        where judge_id = person_id
          and club_id = get_my_club_id()
          and competition_id = tshirt_orders.competition_id
      ))
    )
  );

create policy "tshirt_orders_club_insert"
  on public.tshirt_orders for insert
  with check (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id())) or
      (person_type = 'judge'   and exists (
        select 1 from public.competition_judge_nominations
        where judge_id = person_id
          and club_id = get_my_club_id()
          and competition_id = tshirt_orders.competition_id
      ))
    )
  );

create policy "tshirt_orders_club_update"
  on public.tshirt_orders for update
  using (
    get_my_role() = 'club' and (
      (person_type = 'gymnast' and person_id in (select id from public.gymnasts where club_id = get_my_club_id())) or
      (person_type = 'coach'   and person_id in (select id from public.coaches   where club_id = get_my_club_id())) or
      (person_type = 'judge'   and exists (
        select 1 from public.competition_judge_nominations
        where judge_id = person_id
          and club_id = get_my_club_id()
          and competition_id = tshirt_orders.competition_id
      ))
    )
  );

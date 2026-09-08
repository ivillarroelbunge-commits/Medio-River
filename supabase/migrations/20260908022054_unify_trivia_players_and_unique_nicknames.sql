alter table public.trivia_participants
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.trivia_participants
  alter column email drop not null;

insert into public.trivia_participants (id, device_id, display_name, email, user_id, created_at)
select
  r.user_id,
  gen_random_uuid(),
  coalesce(nullif(btrim(p.display_name), ''), split_part(coalesce(p.email, ''), '@', 1), 'Jugador'),
  p.email,
  r.user_id,
  min(r.played_at)
from public.trivia_results r
left join public.profiles p on p.id = r.user_id
where r.user_id is not null
group by r.user_id, p.display_name, p.email
on conflict (id) do update
set user_id = coalesce(public.trivia_participants.user_id, excluded.user_id),
    email = coalesce(public.trivia_participants.email, excluded.email);

create unique index if not exists trivia_participants_user_id_unique
  on public.trivia_participants (user_id)
  where user_id is not null;

do $$
declare
  rec record;
  base_name text;
  candidate text;
  suffix integer;
begin
  create temporary table if not exists _trivia_used_nicknames (
    nickname_key text primary key
  ) on commit drop;
  truncate table _trivia_used_nicknames;

  for rec in
    select
      tp.id,
      tp.display_name,
      coalesce(min(r.played_at), tp.created_at) as first_seen
    from public.trivia_participants tp
    left join public.trivia_results r on r.ranking_id = tp.id
    group by tp.id, tp.display_name, tp.created_at
    order by first_seen asc, tp.created_at asc, tp.id asc
  loop
    base_name := nullif(btrim(rec.display_name), '');
    if base_name is null then
      base_name := 'Jugador';
    end if;
    base_name := left(base_name, 70);
    candidate := base_name;
    suffix := 2;

    while exists (
      select 1 from _trivia_used_nicknames where nickname_key = lower(btrim(candidate))
    ) loop
      candidate := left(base_name, 70) || ' ' || suffix::text;
      suffix := suffix + 1;
    end loop;

    update public.trivia_participants
    set display_name = candidate
    where id = rec.id;

    insert into _trivia_used_nicknames (nickname_key)
    values (lower(btrim(candidate)));
  end loop;
end
$$;

create unique index if not exists trivia_participants_nickname_unique
  on public.trivia_participants (lower(btrim(display_name)));

update public.trivia_results r
set participant_name = p.display_name
from public.trivia_participants p
where r.ranking_id = p.id
  and r.participant_name is distinct from p.display_name;

create unique index if not exists trivia_results_one_attempt_per_player_week
  on public.trivia_results (ranking_id, daily_key);

revoke insert on public.trivia_participants from anon, authenticated;
grant insert (id, device_id, display_name, email) on public.trivia_participants to anon, authenticated;

drop policy if exists "Anyone can register a trivia device" on public.trivia_participants;
create policy "Anyone can register a trivia device"
  on public.trivia_participants
  for insert
  to anon, authenticated
  with check (
    user_id is null
    and id is not null
    and device_id is not null
    and char_length(btrim(display_name)) between 1 and 80
    and (email is null or char_length(btrim(email)) between 3 and 254)
  );

create or replace function public.resolve_trivia_player(
  p_player_id uuid,
  p_device_id uuid
)
returns table (
  player_id uuid,
  device_id uuid,
  nickname text
)
language sql
security definer
stable
set search_path = ''
as $$
  select p.id, p.device_id, p.display_name
  from public.trivia_participants p
  where p.id = p_player_id
    and p.device_id = p_device_id
  limit 1;
$$;

revoke all on function public.resolve_trivia_player(uuid, uuid) from public;
grant execute on function public.resolve_trivia_player(uuid, uuid) to anon, authenticated;

create or replace function public.sync_trivia_player(
  p_player_id uuid default null,
  p_device_id uuid default null
)
returns table (
  player_id uuid,
  device_id uuid,
  nickname text,
  linked_user_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_local public.trivia_participants%rowtype;
  v_account public.trivia_participants%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into v_account
  from public.trivia_participants p
  where p.user_id = v_user_id
  limit 1;

  if p_player_id is not null and p_device_id is not null then
    select * into v_local
    from public.trivia_participants p
    where p.id = p_player_id
      and p.device_id = p_device_id
    limit 1;

    if found and v_local.user_id is not null and v_local.user_id <> v_user_id then
      raise exception 'Trivia player belongs to another account' using errcode = '42501';
    end if;
  end if;

  if v_account.id is null and v_local.id is not null then
    update public.trivia_participants
    set user_id = v_user_id
    where id = v_local.id
    returning * into v_account;
  elsif v_account.id is not null and v_local.id is not null and v_account.id <> v_local.id then
    delete from public.trivia_results guest_result
    where guest_result.participant_id = v_local.id
      and exists (
        select 1
        from public.trivia_results account_result
        where account_result.ranking_id = v_account.id
          and account_result.daily_key = guest_result.daily_key
      );

    update public.trivia_results
    set participant_id = v_account.id,
        ranking_id = v_account.id,
        participant_name = v_account.display_name
    where participant_id = v_local.id;

    delete from public.trivia_participants
    where id = v_local.id;
  end if;

  if v_account.id is null then
    return;
  end if;

  return query
  select v_account.id, v_account.device_id, v_account.display_name, v_account.user_id;
end;
$$;

revoke all on function public.sync_trivia_player(uuid, uuid) from public, anon;
grant execute on function public.sync_trivia_player(uuid, uuid) to authenticated;

create or replace function private.prepare_trivia_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
  resolved_ranking_id uuid;
begin
  if new.user_id is null then
    if new.participant_id is null or new.device_id is null then
      raise exception 'Invalid trivia device identity' using errcode = '23514';
    end if;

    select p.display_name into resolved_name
    from public.trivia_participants p
    where p.id = new.participant_id and p.device_id = new.device_id;

    if not found then
      raise exception 'Invalid trivia device identity' using errcode = '23514';
    end if;

    new.participant_name := resolved_name;
    new.ranking_id := new.participant_id;
    new.device_id := null;
  else
    new.participant_id := null;
    new.device_id := null;

    select p.id, p.display_name
    into resolved_ranking_id, resolved_name
    from public.trivia_participants p
    where p.user_id = new.user_id
    limit 1;

    if resolved_ranking_id is null then
      select coalesce(nullif(btrim(p.display_name), ''), 'Usuario')
      into resolved_name
      from public.profiles p
      where p.id = new.user_id;
      resolved_ranking_id := new.user_id;
    end if;

    new.participant_name := coalesce(resolved_name, 'Usuario');
    new.ranking_id := resolved_ranking_id;
  end if;
  return new;
end;
$$;

revoke all on function private.prepare_trivia_result() from public, anon, authenticated, service_role;

drop policy if exists "Accounts can insert trivia results" on public.trivia_results;
create policy "Accounts can insert trivia results"
  on public.trivia_results
  for insert
  to authenticated
  with check (user_id = auth.uid() and participant_id is null);

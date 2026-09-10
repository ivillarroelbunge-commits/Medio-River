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
  v_profile_name text;
  v_profile_email text;
  v_base_name text;
  v_candidate text;
  v_suffix integer := 2;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.display_name, p.email
  into v_profile_name, v_profile_email
  from public.profiles p
  where p.id = v_user_id
  limit 1;

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
    set user_id = v_user_id,
        email = coalesce(public.trivia_participants.email, v_profile_email)
    where id = v_local.id
    returning * into v_account;
  elsif v_account.id is not null and v_local.id is not null and v_account.id <> v_local.id then
    delete from public.trivia_results guest_result
    where guest_result.ranking_id = v_local.id
      and exists (
        select 1
        from public.trivia_results account_result
        where account_result.ranking_id = v_account.id
          and account_result.daily_key = guest_result.daily_key
      );

    update public.trivia_results
    set user_id = v_user_id,
        participant_id = null,
        device_id = null,
        ranking_id = v_account.id,
        participant_name = v_account.display_name
    where ranking_id = v_local.id;

    delete from public.trivia_participants
    where id = v_local.id;
  end if;

  if v_account.id is null then
    v_base_name := coalesce(
      nullif(btrim(v_profile_name), ''),
      nullif(split_part(coalesce(v_profile_email, ''), '@', 1), ''),
      'Usuario'
    );
    v_candidate := left(v_base_name, 70);

    while exists (
      select 1
      from public.trivia_participants p
      where lower(btrim(p.display_name)) = lower(btrim(v_candidate))
    ) loop
      v_candidate := left(v_base_name, 70) || ' ' || v_suffix::text;
      v_suffix := v_suffix + 1;
    end loop;

    insert into public.trivia_participants (
      id,
      device_id,
      display_name,
      email,
      user_id
    )
    values (
      v_user_id,
      coalesce(p_device_id, gen_random_uuid()),
      v_candidate,
      v_profile_email,
      v_user_id
    )
    returning * into v_account;
  end if;

  update public.trivia_results
  set user_id = v_user_id,
      participant_id = null,
      device_id = null,
      ranking_id = v_account.id,
      participant_name = v_account.display_name
  where ranking_id = v_account.id
    and (user_id is null or user_id = v_user_id);

  return query
  select v_account.id, v_account.device_id, v_account.display_name, v_account.user_id;
end;
$$;

revoke all on function public.sync_trivia_player(uuid, uuid) from public, anon;
grant execute on function public.sync_trivia_player(uuid, uuid) to authenticated;

create or replace function private.require_complete_player_rating_ballot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group record;
  v_total bigint;
  v_rated bigint;
begin
  for v_group in
    select distinct n.match_id, n.voter_key
    from new_ratings n
  loop
    select count(*)::bigint
      into v_total
    from public.match_rating_players mp
    where mp.match_id = v_group.match_id;

    select count(*)::bigint
      into v_rated
    from public.player_ratings pr
    where pr.match_id = v_group.match_id
      and pr.voter_key = v_group.voter_key;

    if v_total = 0 or v_rated <> v_total then
      raise exception 'Tenés que puntuar a todos los jugadores antes de enviar.'
        using errcode = 'P0001';
    end if;
  end loop;

  return null;
end;
$$;

revoke all on function private.require_complete_player_rating_ballot() from public, anon, authenticated, service_role;

drop trigger if exists require_complete_player_rating_ballot on public.player_ratings;
create trigger require_complete_player_rating_ballot
after insert on public.player_ratings
referencing new table as new_ratings
for each statement
execute function private.require_complete_player_rating_ballot();

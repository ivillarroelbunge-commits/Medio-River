create or replace function private.prevent_player_rating_value_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.rating is distinct from old.rating then
    raise exception 'Las puntuaciones enviadas son definitivas y no se pueden modificar.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_player_rating_value_change() from public, anon, authenticated, service_role;

drop trigger if exists prevent_player_rating_value_change on public.player_ratings;
create trigger prevent_player_rating_value_change
before update on public.player_ratings
for each row execute function private.prevent_player_rating_value_change();

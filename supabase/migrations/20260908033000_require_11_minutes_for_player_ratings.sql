create or replace function private.rating_event_minute(value text)
returns integer
language sql
immutable
security invoker
set search_path = ''
as $$
  with parsed as (
    select regexp_match(trim(coalesce(value, '')), '([0-9]+)(?:\s*\+\s*([0-9]+))?') as parts
  )
  select case
    when parts is null then null
    else parts[1]::integer + coalesce(parts[2]::integer, 0)
  end
  from parsed;
$$;

revoke all on function private.rating_event_minute(text) from public, anon, authenticated, service_role;

create or replace function private.prepare_match_player_ratings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match_end integer := case
    when coalesce((new.detail ->> 'wentToExtraTime')::boolean, false) then 120
    else 90
  end;
begin
  if new.status <> 'played' or new.detail is null then
    return new;
  end if;

  -- Keep only players who were on the pitch for strictly more than 10 minutes.
  -- A player with exactly 10 minutes does not qualify.
  with substitutions as (
    select
      e.event,
      e.ordinality::integer as ordinality,
      private.rating_event_minute(e.event ->> 'minute') as event_minute,
      private.rating_player_key(e.event ->> 'playerIn') as player_in_key,
      private.rating_player_key(e.event ->> 'playerOut') as player_out_key
    from jsonb_array_elements(
      coalesce(new.detail -> 'substitutions', '[]'::jsonb)
    ) with ordinality as e(event, ordinality)
    where e.event ->> 'team' = 'river'
  ),
  starters as (
    select
      p.player_name,
      private.rating_player_key(p.player_name) as player_key,
      true as starter,
      null::text as entered_minute,
      0 as start_minute,
      p.ordinality::integer as display_order
    from jsonb_array_elements_text(
      coalesce(new.detail #> '{lineups,river,starters}', '[]'::jsonb)
    ) with ordinality as p(player_name, ordinality)
    where trim(p.player_name) <> ''
  ),
  entrants as (
    select
      s.event ->> 'playerIn' as player_name,
      s.player_in_key as player_key,
      false as starter,
      nullif(s.event ->> 'minute', '') as entered_minute,
      s.event_minute as start_minute,
      (100 + s.ordinality)::integer as display_order
    from substitutions s
    where trim(coalesce(s.event ->> 'playerIn', '')) <> ''
      and s.player_in_key <> ''
      and s.event_minute is not null
  ),
  raw_players as (
    select * from starters
    union all
    select * from entrants
  ),
  deduped as (
    select distinct on (r.player_key)
      r.player_name,
      r.player_key,
      r.starter,
      r.entered_minute,
      r.start_minute,
      r.display_order
    from raw_players r
    where r.player_key <> ''
    order by r.player_key, r.starter desc, r.display_order asc
  ),
  with_exit as (
    select
      d.*,
      coalesce((
        select min(s.event_minute)
        from substitutions s
        where s.player_out_key = d.player_key
          and s.event_minute is not null
          and s.event_minute >= d.start_minute
      ), v_match_end) as end_minute
    from deduped d
  ),
  eligible as (
    select
      w.player_name,
      w.player_key,
      w.starter,
      w.entered_minute,
      w.display_order
    from with_exit w
    where greatest(0, w.end_minute - w.start_minute) > 10
  )
  delete from public.match_rating_players mp
  where mp.match_id = new.id
    and not exists (
      select 1 from eligible e where e.player_key = mp.player_key
    );

  with substitutions as (
    select
      e.event,
      e.ordinality::integer as ordinality,
      private.rating_event_minute(e.event ->> 'minute') as event_minute,
      private.rating_player_key(e.event ->> 'playerIn') as player_in_key,
      private.rating_player_key(e.event ->> 'playerOut') as player_out_key
    from jsonb_array_elements(
      coalesce(new.detail -> 'substitutions', '[]'::jsonb)
    ) with ordinality as e(event, ordinality)
    where e.event ->> 'team' = 'river'
  ),
  starters as (
    select
      p.player_name,
      private.rating_player_key(p.player_name) as player_key,
      true as starter,
      null::text as entered_minute,
      0 as start_minute,
      p.ordinality::integer as display_order
    from jsonb_array_elements_text(
      coalesce(new.detail #> '{lineups,river,starters}', '[]'::jsonb)
    ) with ordinality as p(player_name, ordinality)
    where trim(p.player_name) <> ''
  ),
  entrants as (
    select
      s.event ->> 'playerIn' as player_name,
      s.player_in_key as player_key,
      false as starter,
      nullif(s.event ->> 'minute', '') as entered_minute,
      s.event_minute as start_minute,
      (100 + s.ordinality)::integer as display_order
    from substitutions s
    where trim(coalesce(s.event ->> 'playerIn', '')) <> ''
      and s.player_in_key <> ''
      and s.event_minute is not null
  ),
  raw_players as (
    select * from starters
    union all
    select * from entrants
  ),
  deduped as (
    select distinct on (r.player_key)
      r.player_name,
      r.player_key,
      r.starter,
      r.entered_minute,
      r.start_minute,
      r.display_order
    from raw_players r
    where r.player_key <> ''
    order by r.player_key, r.starter desc, r.display_order asc
  ),
  with_exit as (
    select
      d.*,
      coalesce((
        select min(s.event_minute)
        from substitutions s
        where s.player_out_key = d.player_key
          and s.event_minute is not null
          and s.event_minute >= d.start_minute
      ), v_match_end) as end_minute
    from deduped d
  ),
  eligible as (
    select
      w.player_name,
      w.player_key,
      w.starter,
      w.entered_minute,
      w.display_order
    from with_exit w
    where greatest(0, w.end_minute - w.start_minute) > 10
  )
  insert into public.match_rating_players (
    match_id,
    squad_player_id,
    player_name,
    player_key,
    starter,
    entered_minute,
    display_order
  )
  select
    new.id,
    (
      select sp.id
      from public.squad_players sp
      where private.rating_player_key(sp.name) = e.player_key
      order by sp.active desc, sp.display_order asc
      limit 1
    ),
    e.player_name,
    e.player_key,
    e.starter,
    e.entered_minute,
    e.display_order
  from eligible e
  on conflict (match_id, player_key) do update
    set squad_player_id = coalesce(excluded.squad_player_id, public.match_rating_players.squad_player_id),
        player_name = excluded.player_name,
        starter = excluded.starter,
        entered_minute = excluded.entered_minute,
        display_order = excluded.display_order;

  if exists (
    select 1 from public.match_rating_players mp where mp.match_id = new.id
  ) then
    insert into public.news_articles (
      slug,
      title,
      excerpt,
      intro,
      content,
      image,
      author,
      published_at,
      category,
      competition,
      tag,
      featured,
      article_type,
      match_id
    ) values (
      'puntuaciones-' || regexp_replace(lower(new.id), '[^a-z0-9]+', '-', 'g'),
      'River ' || coalesce(new.river_score, 0)::text || '-' || coalesce(new.opponent_score, 0)::text || ' ' || new.opponent || ': calificá a los jugadores',
      'Poneles nota del 1 al 10 a los jugadores de River que disputaron más de 10 minutos y compará tus puntuaciones con las de los demás hinchas.',
      'Calificá a cada jugador que disputó más de 10 minutos del partido. Podés votar o ver directamente el promedio de la gente.',
      '[]'::jsonb,
      '/crests/river-plate.jpg',
      'Redacción Medio River',
      timezone('utc'::text, now()),
      'Puntuaciones',
      new.competition,
      'Información',
      false,
      'player_ratings',
      new.id
    )
    on conflict do nothing;
  end if;

  update public.news_articles
  set excerpt = 'Poneles nota del 1 al 10 a los jugadores de River que disputaron más de 10 minutos y compará tus puntuaciones con las de los demás hinchas.',
      intro = 'Calificá a cada jugador que disputó más de 10 minutos del partido. Podés votar o ver directamente el promedio de la gente.'
  where article_type = 'player_ratings'
    and match_id = new.id;

  return new;
end;
$$;

revoke all on function private.prepare_match_player_ratings() from public, anon, authenticated, service_role;

-- Recalculate every ratings article that already exists so old ballots obey the new rule too.
update public.matches m
set detail = m.detail
where m.id in (
  select n.match_id
  from public.news_articles n
  where n.article_type = 'player_ratings'
    and n.match_id is not null
);

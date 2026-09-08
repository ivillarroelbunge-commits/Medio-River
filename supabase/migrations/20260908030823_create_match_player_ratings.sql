alter table public.news_articles
  add column if not exists article_type text not null default 'standard',
  add column if not exists match_id text references public.matches(id) on delete set null;

alter table public.news_articles
  drop constraint if exists news_articles_article_type_check;
alter table public.news_articles
  add constraint news_articles_article_type_check
  check (article_type in ('standard', 'player_ratings'));

create unique index if not exists uq_news_articles_player_ratings_match
  on public.news_articles(match_id)
  where article_type = 'player_ratings' and match_id is not null;

create table if not exists public.match_rating_players (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references public.matches(id) on delete cascade,
  squad_player_id text references public.squad_players(id) on delete set null,
  player_name text not null,
  player_key text not null,
  starter boolean not null default false,
  entered_minute text,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (match_id, player_key)
);

create index if not exists idx_match_rating_players_match_order
  on public.match_rating_players(match_id, display_order);
create index if not exists idx_match_rating_players_squad
  on public.match_rating_players(squad_player_id);

alter table public.match_rating_players enable row level security;
revoke all on table public.match_rating_players from anon, authenticated;
grant select, insert, update, delete on table public.match_rating_players to service_role;

create table if not exists public.player_ratings (
  id uuid primary key default gen_random_uuid(),
  match_player_id uuid not null references public.match_rating_players(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  squad_player_id text references public.squad_players(id) on delete set null,
  player_name text not null,
  user_id uuid references auth.users(id) on delete cascade,
  device_id uuid not null,
  voter_key text not null,
  rating smallint not null check (rating between 1 and 10),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (match_player_id, voter_key)
);

create index if not exists idx_player_ratings_match_player
  on public.player_ratings(match_player_id);
create index if not exists idx_player_ratings_match
  on public.player_ratings(match_id);
create index if not exists idx_player_ratings_user
  on public.player_ratings(user_id) where user_id is not null;
create index if not exists idx_player_ratings_device
  on public.player_ratings(device_id) where user_id is null;
create index if not exists idx_player_ratings_squad
  on public.player_ratings(squad_player_id);

alter table public.player_ratings enable row level security;
revoke all on table public.player_ratings from anon, authenticated;
grant select, insert, update, delete on table public.player_ratings to service_role;

create trigger set_player_ratings_updated_at
before update on public.player_ratings
for each row execute function public.set_updated_at();

create table if not exists public.match_player_rating_stats (
  match_player_id uuid primary key references public.match_rating_players(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  rating_sum bigint not null default 0,
  rating_count bigint not null default 0 check (rating_count >= 0),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_match_player_rating_stats_match
  on public.match_player_rating_stats(match_id);

alter table public.match_player_rating_stats enable row level security;
revoke all on table public.match_player_rating_stats from anon, authenticated;
grant select, insert, update, delete on table public.match_player_rating_stats to service_role;

create or replace function private.rating_player_key(value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select regexp_replace(
    lower(translate(trim(coalesce(value, '')), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
    '[^a-z0-9]+',
    '',
    'g'
  );
$$;

revoke all on function private.rating_player_key(text) from public, anon, authenticated, service_role;

create or replace function private.refresh_match_player_rating_stat(p_match_player_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match_id text;
  v_sum bigint;
  v_count bigint;
begin
  select mp.match_id
    into v_match_id
  from public.match_rating_players mp
  where mp.id = p_match_player_id;

  if v_match_id is null then
    delete from public.match_player_rating_stats s
    where s.match_player_id = p_match_player_id;
    return;
  end if;

  select coalesce(sum(r.rating), 0)::bigint, count(*)::bigint
    into v_sum, v_count
  from public.player_ratings r
  where r.match_player_id = p_match_player_id;

  if v_count = 0 then
    delete from public.match_player_rating_stats s
    where s.match_player_id = p_match_player_id;
    return;
  end if;

  insert into public.match_player_rating_stats (
    match_player_id, match_id, rating_sum, rating_count, updated_at
  ) values (
    p_match_player_id, v_match_id, v_sum, v_count, timezone('utc'::text, now())
  )
  on conflict (match_player_id) do update
    set match_id = excluded.match_id,
        rating_sum = excluded.rating_sum,
        rating_count = excluded.rating_count,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function private.refresh_match_player_rating_stat(uuid) from public, anon, authenticated, service_role;

create or replace function private.sync_match_player_rating_stat()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_match_player_rating_stat(old.match_player_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.match_player_id is distinct from new.match_player_id then
    perform private.refresh_match_player_rating_stat(old.match_player_id);
  end if;

  perform private.refresh_match_player_rating_stat(new.match_player_id);
  return new;
end;
$$;

revoke all on function private.sync_match_player_rating_stat() from public, anon, authenticated, service_role;

drop trigger if exists sync_match_player_rating_stat on public.player_ratings;
create trigger sync_match_player_rating_stat
after insert or update or delete on public.player_ratings
for each row execute function private.sync_match_player_rating_stat();

create or replace function private.prepare_match_player_ratings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'played' or new.detail is null then
    return new;
  end if;

  with starters as (
    select
      p.player_name,
      true as starter,
      null::text as entered_minute,
      p.ordinality::integer as display_order
    from jsonb_array_elements_text(
      coalesce(new.detail #> '{lineups,river,starters}', '[]'::jsonb)
    ) with ordinality as p(player_name, ordinality)
    where trim(p.player_name) <> ''
  ),
  entrants as (
    select
      e.event ->> 'playerIn' as player_name,
      false as starter,
      nullif(e.event ->> 'minute', '') as entered_minute,
      (100 + e.ordinality)::integer as display_order
    from jsonb_array_elements(
      coalesce(new.detail -> 'substitutions', '[]'::jsonb)
    ) with ordinality as e(event, ordinality)
    where e.event ->> 'team' = 'river'
      and trim(coalesce(e.event ->> 'playerIn', '')) <> ''
  ),
  raw_players as (
    select * from starters
    union all
    select * from entrants
  ),
  deduped as (
    select distinct on (private.rating_player_key(r.player_name))
      r.player_name,
      private.rating_player_key(r.player_name) as player_key,
      r.starter,
      r.entered_minute,
      r.display_order
    from raw_players r
    where private.rating_player_key(r.player_name) <> ''
    order by private.rating_player_key(r.player_name), r.starter desc, r.display_order asc
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
      where private.rating_player_key(sp.name) = d.player_key
      order by sp.active desc, sp.display_order asc
      limit 1
    ),
    d.player_name,
    d.player_key,
    d.starter,
    d.entered_minute,
    d.display_order
  from deduped d
  on conflict (match_id, player_key) do update
    set squad_player_id = coalesce(excluded.squad_player_id, public.match_rating_players.squad_player_id),
        starter = public.match_rating_players.starter or excluded.starter,
        entered_minute = coalesce(public.match_rating_players.entered_minute, excluded.entered_minute),
        display_order = least(public.match_rating_players.display_order, excluded.display_order);

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
      'Poneles nota del 1 al 10 a los jugadores de River y compará tus puntuaciones con las de los demás hinchas.',
      'Calificá a cada jugador que participó del partido. Podés votar o ver directamente el promedio de la gente.',
      '[]'::jsonb,
      '/crests/river-plate.jpg',
      'Redacción Medio River',
      timezone('utc'::text, now()),
      'Puntuaciones',
      new.competition,
      'Opinión',
      false,
      'player_ratings',
      new.id
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.prepare_match_player_ratings() from public, anon, authenticated, service_role;

drop trigger if exists prepare_match_player_ratings on public.matches;
create trigger prepare_match_player_ratings
after insert or update of status, detail, river_score, opponent_score on public.matches
for each row
when (new.status = 'played')
execute function private.prepare_match_player_ratings();

-- Seed the feature for the most recent completed match so it is immediately testable.
update public.matches
set detail = detail
where id = (
  select m.id
  from public.matches m
  where m.status = 'played'
    and jsonb_array_length(coalesce(m.detail #> '{lineups,river,starters}', '[]'::jsonb)) > 0
  order by m.date desc
  limit 1
);

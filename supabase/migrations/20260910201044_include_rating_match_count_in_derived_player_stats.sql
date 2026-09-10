create or replace view public.player_derived_season_stats
with (security_invoker = true)
as
with competition_map(competition_name, competition_key) as (
  values
    ('Torneo Clausura'::text, 'clausura'::text),
    ('Torneo Apertura'::text, 'apertura'::text),
    ('Copa Sudamericana'::text, 'sudamericana'::text),
    ('Copa Argentina'::text, 'copaArgentina'::text)
),
players as (
  select
    sp.id as player_id,
    sp.name,
    sp.position,
    public.player_stats_name_key(sp.name) as player_key,
    coalesce(pss.source_id, sp.fotmob_id, 0) as source_id,
    coalesce(pss.updated_at::date, date '2025-12-31') as baseline_date,
    coalesce(pss.competitions, '{}'::jsonb) as baseline_competitions,
    pss.updated_at::date as original_updated_at
  from public.squad_players sp
  left join public.player_season_stats pss on pss.player_id = sp.id
  where sp.active = true
),
eligible_matches as (
  select
    m.id,
    m.date,
    m.competition,
    cm.competition_key,
    m.opponent_score,
    m.detail,
    case when coalesce((m.detail ->> 'wentToExtraTime')::boolean, false) then 120 else 90 end as match_end
  from public.matches m
  join competition_map cm on cm.competition_name = m.competition
  where m.status = 'played'
    and m.detail is not null
    and m.date >= timestamptz '2026-01-01 00:00:00+00'
    and m.date < timestamptz '2027-01-01 00:00:00+00'
),
substitutions as (
  select
    m.id as match_id,
    public.player_stats_name_key(e.event ->> 'playerIn') as player_in_key,
    public.player_stats_name_key(e.event ->> 'playerOut') as player_out_key,
    public.player_stats_event_minute(e.event ->> 'minute') as event_minute
  from eligible_matches m
  cross join lateral jsonb_array_elements(coalesce(m.detail -> 'substitutions', '[]'::jsonb)) as e(event)
  where e.event ->> 'team' = 'river'
),
starters as (
  select
    m.id as match_id,
    public.player_stats_name_key(s.player_name) as player_key,
    0 as start_minute,
    true as starter
  from eligible_matches m
  cross join lateral jsonb_array_elements_text(coalesce(m.detail #> '{lineups,river,starters}', '[]'::jsonb)) as s(player_name)
  where trim(s.player_name) <> ''
),
entrants as (
  select s.match_id, s.player_in_key as player_key, s.event_minute as start_minute, false as starter
  from substitutions s
  where s.player_in_key <> '' and s.event_minute is not null
),
participants as (
  select r.match_id, r.player_key, min(r.start_minute) as start_minute, bool_or(r.starter) as starter
  from (select * from starters union all select * from entrants) r
  where r.player_key <> ''
  group by r.match_id, r.player_key
),
exits as (
  select match_id, player_out_key as player_key, min(event_minute) as exit_minute
  from substitutions
  where player_out_key <> '' and event_minute is not null
  group by match_id, player_out_key
),
red_cards as (
  select
    m.id as match_id,
    public.player_stats_name_key(c.event ->> 'player') as player_key,
    min(public.player_stats_event_minute(c.event ->> 'minute')) as red_minute
  from eligible_matches m
  cross join lateral jsonb_array_elements(coalesce(m.detail -> 'cards', '[]'::jsonb)) as c(event)
  where c.event ->> 'team' = 'river' and c.event ->> 'card' = 'red'
  group by m.id, public.player_stats_name_key(c.event ->> 'player')
),
participant_minutes as (
  select
    m.id as match_id,
    m.date,
    m.competition_key,
    m.opponent_score,
    p.player_key,
    greatest(0, least(m.match_end, coalesce(x.exit_minute, m.match_end), coalesce(rc.red_minute, m.match_end)) - p.start_minute)::integer as minutes_played
  from eligible_matches m
  join participants p on p.match_id = m.id
  left join exits x on x.match_id = p.match_id and x.player_key = p.player_key
  left join red_cards rc on rc.match_id = p.match_id and rc.player_key = p.player_key
),
appearance_stats as (
  select
    p.player_id,
    pm.competition_key,
    count(*) filter (where pm.date::date > p.baseline_date)::integer as matches,
    coalesce(sum(pm.minutes_played) filter (where pm.date::date > p.baseline_date), 0)::integer as minutes,
    count(*) filter (where pm.date::date > p.baseline_date and lower(p.position) like '%arquero%' and coalesce(pm.opponent_score, 0) = 0)::integer as clean_sheets
  from players p
  join participant_minutes pm on pm.player_key = p.player_key
  group by p.player_id, pm.competition_key
),
goal_events as (
  select m.date, m.competition_key, public.player_stats_name_key(g.event ->> 'player') as player_key
  from eligible_matches m
  cross join lateral jsonb_array_elements(coalesce(m.detail -> 'goals', '[]'::jsonb)) as g(event)
  where g.event ->> 'team' = 'river'
),
assist_events as (
  select m.date, m.competition_key, public.player_stats_name_key(g.event ->> 'assist') as player_key
  from eligible_matches m
  cross join lateral jsonb_array_elements(coalesce(m.detail -> 'goals', '[]'::jsonb)) as g(event)
  where g.event ->> 'team' = 'river' and trim(coalesce(g.event ->> 'assist', '')) <> ''
),
card_events as (
  select m.date, m.competition_key, public.player_stats_name_key(c.event ->> 'player') as player_key, c.event ->> 'card' as card
  from eligible_matches m
  cross join lateral jsonb_array_elements(coalesce(m.detail -> 'cards', '[]'::jsonb)) as c(event)
  where c.event ->> 'team' = 'river'
),
event_stats as (
  select
    p.player_id,
    cm.competition_key,
    (select count(*) from goal_events ge where ge.player_key = p.player_key and ge.competition_key = cm.competition_key and ge.date::date > p.baseline_date)::integer as goals,
    (select count(*) from assist_events ae where ae.player_key = p.player_key and ae.competition_key = cm.competition_key and ae.date::date > p.baseline_date)::integer as assists,
    (select count(*) from card_events ce where ce.player_key = p.player_key and ce.competition_key = cm.competition_key and ce.card = 'yellow' and ce.date::date > p.baseline_date)::integer as yellow_cards,
    (select count(*) from card_events ce where ce.player_key = p.player_key and ce.competition_key = cm.competition_key and ce.card = 'red' and ce.date::date > p.baseline_date)::integer as red_cards
  from players p
  cross join competition_map cm
),
crowd_match_ratings as (
  select
    p.player_id,
    m.competition_key,
    mp.match_id,
    (s.rating_sum::numeric / nullif(s.rating_count, 0)::numeric) as match_average
  from players p
  join public.match_rating_players mp on mp.squad_player_id = p.player_id or (mp.squad_player_id is null and mp.player_key = p.player_key)
  join public.match_player_rating_stats s on s.match_player_id = mp.id
  join eligible_matches m on m.id = mp.match_id
  where s.rating_count > 0
),
crowd_ratings as (
  select player_id, competition_key, round(avg(match_average), 2) as rating, count(*)::integer as rating_matches
  from crowd_match_ratings
  group by player_id, competition_key
),
combined as (
  select
    p.player_id,
    p.source_id,
    p.original_updated_at,
    cm.competition_key,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'matches')::integer, 0) + coalesce(a.matches, 0) as matches,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'minutes')::integer, 0) + coalesce(a.minutes, 0) as minutes,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'goals')::integer, 0) + coalesce(e.goals, 0) as goals,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'assists')::integer, 0) + coalesce(e.assists, 0) as assists,
    r.rating,
    coalesce(r.rating_matches, 0) as rating_matches,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'yellowCards')::integer, 0) + coalesce(e.yellow_cards, 0) as yellow_cards,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'redCards')::integer, 0) + coalesce(e.red_cards, 0) as red_cards,
    coalesce((p.baseline_competitions -> cm.competition_key ->> 'cleanSheets')::integer, 0) + coalesce(a.clean_sheets, 0) as clean_sheets
  from players p
  cross join competition_map cm
  left join appearance_stats a on a.player_id = p.player_id and a.competition_key = cm.competition_key
  left join event_stats e on e.player_id = p.player_id and e.competition_key = cm.competition_key
  left join crowd_ratings r on r.player_id = p.player_id and r.competition_key = cm.competition_key
)
select
  c.player_id,
  max(c.source_id)::integer as source_id,
  greatest(coalesce(max(c.original_updated_at), date '2026-01-01'), coalesce((select max(em.date)::date from eligible_matches em), date '2026-01-01')) as updated_at,
  jsonb_object_agg(
    c.competition_key,
    jsonb_build_object(
      'matches', c.matches,
      'minutes', c.minutes,
      'goals', c.goals,
      'assists', c.assists,
      'rating', c.rating,
      'ratingMatches', c.rating_matches,
      'yellowCards', c.yellow_cards,
      'redCards', c.red_cards,
      'cleanSheets', c.clean_sheets
    ) order by c.competition_key
  ) as competitions
from combined c
group by c.player_id;

grant select on public.player_derived_season_stats to anon, authenticated;

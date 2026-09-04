create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

alter table public.matches
  add column if not exists promiedos_game_id text;

create unique index if not exists matches_promiedos_game_id_unique
  on public.matches (promiedos_game_id)
  where promiedos_game_id is not null;

alter table public.matches
  drop constraint if exists matches_competition_check;

alter table public.matches
  add constraint matches_competition_check
  check (competition in ('Torneo Apertura', 'Torneo Clausura', 'Copa Sudamericana', 'Copa Argentina', 'Amistoso'));

create index if not exists idx_matches_date on public.matches (date);

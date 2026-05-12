create table if not exists public.player_season_stats (
  player_id text primary key,
  source_id integer not null,
  updated_at text not null,
  competitions jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  row_updated_at timestamptz not null default timezone('utc', now())
);

alter table public.player_season_stats enable row level security;

drop policy if exists "Player season stats are public" on public.player_season_stats;
create policy "Player season stats are public"
  on public.player_season_stats
  for select
  using (true);

drop policy if exists "Admins can insert player season stats" on public.player_season_stats;
create policy "Admins can insert player season stats"
  on public.player_season_stats
  for insert
  to authenticated
  with check (public.can_manage_matches(auth.uid()));

drop policy if exists "Admins can update player season stats" on public.player_season_stats;
create policy "Admins can update player season stats"
  on public.player_season_stats
  for update
  to authenticated
  using (public.can_manage_matches(auth.uid()))
  with check (public.can_manage_matches(auth.uid()));

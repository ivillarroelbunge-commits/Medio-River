create table if not exists public.matches (
  id text primary key,
  date timestamptz not null,
  opponent text not null,
  competition text not null check (competition in ('Torneo Apertura', 'Copa Sudamericana', 'Copa Argentina')),
  status text not null check (status in ('upcoming', 'played')),
  is_home boolean not null,
  stadium text not null,
  tv_channel text,
  river_score integer,
  opponent_score integer,
  referee text,
  detail jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint matches_scores_for_played check (
    (status = 'upcoming' and river_score is null and opponent_score is null)
    or
    (status = 'played' and river_score is not null and opponent_score is not null)
  )
);

alter table public.matches enable row level security;

create or replace function public.can_manage_matches(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and role = 'admin'
  );
$$;

drop trigger if exists set_matches_updated_at on public.matches;

create trigger set_matches_updated_at
  before update on public.matches
  for each row execute procedure public.set_updated_at();

drop policy if exists "Matches are public" on public.matches;
create policy "Matches are public"
  on public.matches
  for select
  using (true);

drop policy if exists "Admins can insert matches" on public.matches;
create policy "Admins can insert matches"
  on public.matches
  for insert
  to authenticated
  with check (public.can_manage_matches(auth.uid()));

drop policy if exists "Admins can update matches" on public.matches;
create policy "Admins can update matches"
  on public.matches
  for update
  to authenticated
  using (public.can_manage_matches(auth.uid()))
  with check (public.can_manage_matches(auth.uid()));

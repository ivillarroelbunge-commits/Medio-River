create table public.squad_players (
  id text primary key,
  name text not null,
  shirt_number smallint,
  line text not null check (line in ('Arqueros','Defensores','Mediocampistas','Delanteros')),
  position text not null,
  birth_date date,
  nationality text not null,
  preferred_foot text,
  from_academy boolean not null default false,
  fotmob_id integer unique,
  image_url text,
  active boolean not null default true,
  joined_on date,
  left_on date,
  display_order integer not null default 0,
  verified_at timestamptz not null default timezone('utc'::text, now()),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint squad_players_shirt_number_check check (shirt_number is null or shirt_number between 1 and 999),
  constraint squad_players_dates_check check (left_on is null or joined_on is null or left_on >= joined_on)
);

create index idx_squad_players_active_line_order
  on public.squad_players(active, line, display_order, shirt_number);

alter table public.squad_players enable row level security;

revoke all on table public.squad_players from anon, authenticated;
grant select on table public.squad_players to anon, authenticated;
grant insert, update, delete on table public.squad_players to authenticated;
grant select, insert, update, delete on table public.squad_players to service_role;

create policy "Squad players are publicly readable"
  on public.squad_players for select
  to anon, authenticated
  using (true);

create policy "Staff can insert squad players"
  on public.squad_players for insert
  to authenticated
  with check ((select private.can_manage_matches((select auth.uid()))));

create policy "Staff can update squad players"
  on public.squad_players for update
  to authenticated
  using ((select private.can_manage_matches((select auth.uid()))))
  with check ((select private.can_manage_matches((select auth.uid()))));

create policy "Staff can delete squad players"
  on public.squad_players for delete
  to authenticated
  using ((select private.can_manage_matches((select auth.uid()))));

create trigger set_squad_players_updated_at
before update on public.squad_players
for each row execute function public.set_updated_at();

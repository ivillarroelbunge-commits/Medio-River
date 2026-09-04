create table if not exists public.trivia_participants (
  id uuid primary key,
  device_id uuid not null unique,
  display_name text not null,
  email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint trivia_participants_display_name_check check (char_length(btrim(display_name)) between 1 and 80),
  constraint trivia_participants_email_check check (char_length(btrim(email)) between 3 and 254)
);

alter table public.trivia_participants enable row level security;
grant insert (id, device_id, display_name, email) on public.trivia_participants to anon, authenticated;

drop policy if exists "Anyone can register a trivia device" on public.trivia_participants;
create policy "Anyone can register a trivia device"
  on public.trivia_participants
  for insert
  to anon, authenticated
  with check (
    id is not null and device_id is not null
    and char_length(btrim(display_name)) between 1 and 80
    and char_length(btrim(email)) between 3 and 254
  );

alter table public.trivia_results alter column user_id drop not null;
alter table public.trivia_results add column if not exists participant_id uuid references public.trivia_participants(id) on delete cascade;
alter table public.trivia_results add column if not exists device_id uuid;
alter table public.trivia_results add column if not exists participant_name text;
alter table public.trivia_results add column if not exists ranking_id uuid;

update public.trivia_results r
set participant_name = coalesce(nullif(btrim(p.display_name), ''), 'Usuario'),
    ranking_id = r.user_id
from public.profiles p
where r.user_id = p.id
  and (r.participant_name is null or r.ranking_id is null);

update public.trivia_results
set participant_name = coalesce(participant_name, 'Usuario'),
    ranking_id = coalesce(ranking_id, user_id)
where participant_name is null or ranking_id is null;

alter table public.trivia_results alter column participant_name set not null;
alter table public.trivia_results alter column ranking_id set not null;

create unique index if not exists trivia_results_one_attempt_per_participant_week
  on public.trivia_results (participant_id, daily_key)
  where participant_id is not null;
create index if not exists idx_trivia_results_ranking_id on public.trivia_results (ranking_id);
create index if not exists idx_trivia_results_daily_key on public.trivia_results (daily_key);

alter table public.trivia_results drop constraint if exists trivia_results_identity_check;
alter table public.trivia_results add constraint trivia_results_identity_check check (
  (user_id is not null and participant_id is null)
  or (user_id is null and participant_id is not null)
);

create schema if not exists private;
create or replace function private.prepare_trivia_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  if new.user_id is null then
    if new.participant_id is null or new.device_id is null then
      raise exception 'Invalid trivia device identity' using errcode = '23514';
    end if;

    select p.display_name into resolved_name
    from public.trivia_participants p
    where p.id = new.participant_id and p.device_id = new.device_id;

    if not found then
      raise exception 'Invalid trivia device identity' using errcode = '23514';
    end if;

    new.participant_name := resolved_name;
    new.ranking_id := new.participant_id;
    new.device_id := null;
  else
    new.participant_id := null;
    new.device_id := null;
    select coalesce(nullif(btrim(p.display_name), ''), 'Usuario') into resolved_name
    from public.profiles p where p.id = new.user_id;
    new.participant_name := coalesce(resolved_name, 'Usuario');
    new.ranking_id := new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function private.prepare_trivia_result() from public, anon, authenticated, service_role;
drop trigger if exists prepare_trivia_result_before_insert on public.trivia_results;
create trigger prepare_trivia_result_before_insert
  before insert on public.trivia_results
  for each row execute function private.prepare_trivia_result();

drop policy if exists "Authenticated users can view trivia results" on public.trivia_results;
drop policy if exists "Anyone can view trivia results" on public.trivia_results;
create policy "Anyone can view trivia results"
  on public.trivia_results
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Devices can insert trivia results" on public.trivia_results;
create policy "Devices can insert trivia results"
  on public.trivia_results
  for insert
  to anon, authenticated
  with check (user_id is null and participant_id is not null and ranking_id = participant_id);

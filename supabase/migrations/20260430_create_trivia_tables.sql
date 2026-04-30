create table if not exists public.trivia_questions (
  id text primary key default gen_random_uuid()::text,
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  explanation text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trivia_questions_options_array check (jsonb_typeof(options) = 'array'),
  constraint trivia_questions_options_count check (jsonb_array_length(options) >= 2),
  constraint trivia_questions_correct_index check (correct_index >= 0 and correct_index < jsonb_array_length(options))
);

create table if not exists public.daily_trivias (
  daily_key text primary key,
  question_ids text[] not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_trivias_questions_count check (cardinality(question_ids) between 1 and 5)
);

create table if not exists public.trivia_results (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_key text not null,
  score integer not null,
  total_questions integer not null,
  played_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint trivia_results_score_check check (score >= 0 and score <= total_questions),
  constraint trivia_results_total_questions_check check (total_questions > 0),
  constraint trivia_results_one_attempt_per_day unique (user_id, daily_key)
);

alter table public.trivia_questions enable row level security;
alter table public.daily_trivias enable row level security;
alter table public.trivia_results enable row level security;

drop trigger if exists set_trivia_questions_updated_at on public.trivia_questions;
create trigger set_trivia_questions_updated_at
  before update on public.trivia_questions
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_daily_trivias_updated_at on public.daily_trivias;
create trigger set_daily_trivias_updated_at
  before update on public.daily_trivias
  for each row execute procedure public.set_updated_at();

drop policy if exists "Trivia questions are public" on public.trivia_questions;
create policy "Trivia questions are public"
  on public.trivia_questions
  for select
  using (true);

drop policy if exists "Admins can insert trivia questions" on public.trivia_questions;
create policy "Admins can insert trivia questions"
  on public.trivia_questions
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update trivia questions" on public.trivia_questions;
create policy "Admins can update trivia questions"
  on public.trivia_questions
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete trivia questions" on public.trivia_questions;
create policy "Admins can delete trivia questions"
  on public.trivia_questions
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Daily trivias are public" on public.daily_trivias;
create policy "Daily trivias are public"
  on public.daily_trivias
  for select
  using (true);

drop policy if exists "Admins can insert daily trivias" on public.daily_trivias;
create policy "Admins can insert daily trivias"
  on public.daily_trivias
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update daily trivias" on public.daily_trivias;
create policy "Admins can update daily trivias"
  on public.daily_trivias
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can view trivia results" on public.trivia_results;
create policy "Authenticated users can view trivia results"
  on public.trivia_results
  for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own trivia results" on public.trivia_results;
create policy "Users can insert their own trivia results"
  on public.trivia_results
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Admins can delete trivia results" on public.trivia_results;
create policy "Admins can delete trivia results"
  on public.trivia_results
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

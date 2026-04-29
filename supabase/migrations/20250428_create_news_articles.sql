create table if not exists public.news_articles (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  intro text not null,
  content jsonb not null default '[]'::jsonb,
  image text,
  author text not null default 'Redacción Medio River',
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default timezone('utc', now()),
  category text not null,
  competition text,
  tag text not null default 'Información' check (tag in ('Información', 'Opinión')),
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.news_articles enable row level security;

create or replace function public.can_manage_news(check_user_id uuid default auth.uid())
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
      and role in ('admin', 'editor')
  );
$$;

drop trigger if exists set_news_articles_updated_at on public.news_articles;

create trigger set_news_articles_updated_at
  before update on public.news_articles
  for each row execute procedure public.set_updated_at();

drop policy if exists "News articles are public" on public.news_articles;
create policy "News articles are public"
  on public.news_articles
  for select
  using (true);

drop policy if exists "Editors and admins can insert news" on public.news_articles;
create policy "Editors and admins can insert news"
  on public.news_articles
  for insert
  to authenticated
  with check (public.can_manage_news(auth.uid()));

drop policy if exists "Editors and admins can update news" on public.news_articles;
create policy "Editors and admins can update news"
  on public.news_articles
  for update
  to authenticated
  using (public.can_manage_news(auth.uid()))
  with check (public.can_manage_news(auth.uid()));

drop policy if exists "Editors and admins can delete news" on public.news_articles;
create policy "Editors and admins can delete news"
  on public.news_articles
  for delete
  to authenticated
  using (public.can_manage_news(auth.uid()));

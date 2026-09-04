create schema if not exists private;

alter function public.is_admin(uuid) set schema private;
alter function public.can_manage_news(uuid) set schema private;
alter function public.can_manage_matches(uuid) set schema private;

alter function private.is_admin(uuid) set search_path = '';
alter function private.can_manage_news(uuid) set search_path = '';
alter function private.can_manage_matches(uuid) set search_path = '';
alter function public.handle_new_user() set search_path = '';
alter function public.set_updated_at() set search_path = '';

revoke all on function private.is_admin(uuid) from public, anon, service_role;
revoke all on function private.can_manage_news(uuid) from public, anon, service_role;
revoke all on function private.can_manage_matches(uuid) from public, anon, service_role;
grant usage on schema private to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;
grant execute on function private.can_manage_news(uuid) to authenticated;
grant execute on function private.can_manage_matches(uuid) to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Rebuild management policies using private helpers and init-plan auth lookups.
drop policy if exists "Admins can insert daily trivias" on public.daily_trivias;
create policy "Admins can insert daily trivias" on public.daily_trivias for insert to authenticated
  with check ((select private.is_admin((select auth.uid()))));
drop policy if exists "Admins can update daily trivias" on public.daily_trivias;
create policy "Admins can update daily trivias" on public.daily_trivias for update to authenticated
  using ((select private.is_admin((select auth.uid()))))
  with check ((select private.is_admin((select auth.uid()))));

drop policy if exists "Admins can insert matches" on public.matches;
create policy "Admins can insert matches" on public.matches for insert to authenticated
  with check ((select private.can_manage_matches((select auth.uid()))));
drop policy if exists "Admins can update matches" on public.matches;
create policy "Admins can update matches" on public.matches for update to authenticated
  using ((select private.can_manage_matches((select auth.uid()))))
  with check ((select private.can_manage_matches((select auth.uid()))));

drop policy if exists "Editors and admins can delete news" on public.news_articles;
create policy "Editors and admins can delete news" on public.news_articles for delete to authenticated
  using ((select private.can_manage_news((select auth.uid()))));
drop policy if exists "Editors and admins can insert news" on public.news_articles;
create policy "Editors and admins can insert news" on public.news_articles for insert to authenticated
  with check ((select private.can_manage_news((select auth.uid()))));
drop policy if exists "Editors and admins can update news" on public.news_articles;
create policy "Editors and admins can update news" on public.news_articles for update to authenticated
  using ((select private.can_manage_news((select auth.uid()))))
  with check ((select private.can_manage_news((select auth.uid()))));

drop policy if exists "Admins can insert player season stats" on public.player_season_stats;
create policy "Admins can insert player season stats" on public.player_season_stats for insert to authenticated
  with check ((select private.can_manage_matches((select auth.uid()))));
drop policy if exists "Admins can update player season stats" on public.player_season_stats;
create policy "Admins can update player season stats" on public.player_season_stats for update to authenticated
  using ((select private.can_manage_matches((select auth.uid()))))
  with check ((select private.can_manage_matches((select auth.uid()))));

drop policy if exists "Admins can delete trivia questions" on public.trivia_questions;
create policy "Admins can delete trivia questions" on public.trivia_questions for delete to authenticated
  using ((select private.is_admin((select auth.uid()))));
drop policy if exists "Admins can insert trivia questions" on public.trivia_questions;
create policy "Admins can insert trivia questions" on public.trivia_questions for insert to authenticated
  with check ((select private.is_admin((select auth.uid()))));
drop policy if exists "Admins can update trivia questions" on public.trivia_questions;
create policy "Admins can update trivia questions" on public.trivia_questions for update to authenticated
  using ((select private.is_admin((select auth.uid()))))
  with check ((select private.is_admin((select auth.uid()))));

drop policy if exists "Admins can delete trivia results" on public.trivia_results;
create policy "Admins can delete trivia results" on public.trivia_results for delete to authenticated
  using ((select private.is_admin((select auth.uid()))));
drop policy if exists "Users can insert their own trivia results" on public.trivia_results;
create policy "Users can insert their own trivia results" on public.trivia_results for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Collapse profile write rules into explicit authenticated policies.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Users or admins can update profiles" on public.profiles;
create policy "Users or admins can update profiles" on public.profiles for update to authenticated
  using (((select auth.uid()) = id) or (select private.is_admin((select auth.uid()))))
  with check (((select auth.uid()) = id) or (select private.is_admin((select auth.uid()))));

create index if not exists idx_matches_updated_by on public.matches(updated_by);
create index if not exists idx_news_articles_author_id on public.news_articles(author_id);
create index if not exists idx_player_season_stats_updated_by on public.player_season_stats(updated_by);

drop policy if exists "Users can insert their own trivia results" on public.trivia_results;
create policy "Users can insert their own trivia results"
  on public.trivia_results
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

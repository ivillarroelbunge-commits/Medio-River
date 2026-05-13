begin;

delete from public.trivia_results;
delete from public.daily_trivias;

alter table public.daily_trivias
  drop constraint if exists daily_trivias_questions_count;

alter table public.daily_trivias
  add constraint daily_trivias_questions_count check (cardinality(question_ids) between 1 and 10);

commit;

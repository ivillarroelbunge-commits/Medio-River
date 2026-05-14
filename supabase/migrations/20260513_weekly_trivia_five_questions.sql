alter table if exists daily_trivias
  drop constraint if exists daily_trivias_questions_count;

alter table if exists daily_trivias
  add constraint daily_trivias_questions_count check (cardinality(question_ids) between 1 and 5);

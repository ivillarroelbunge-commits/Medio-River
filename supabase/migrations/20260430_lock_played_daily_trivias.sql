create or replace function public.daily_trivia_has_results(check_daily_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trivia_results
    where daily_key = check_daily_key
  );
$$;

create or replace function public.prevent_played_daily_trivia_question_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.daily_trivia_has_results(old.daily_key) and new.question_ids is distinct from old.question_ids then
    raise exception 'No se pueden modificar las preguntas de una trivia que ya tiene participantes.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_played_daily_trivia_question_changes on public.daily_trivias;

create trigger prevent_played_daily_trivia_question_changes
  before update on public.daily_trivias
  for each row execute procedure public.prevent_played_daily_trivia_question_changes();

create or replace function public.prevent_referenced_trivia_question_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.daily_trivias
    where question_ids @> array[old.id]
  ) then
    raise exception 'No se puede eliminar una pregunta que ya fue usada en una trivia.';
  end if;

  return old;
end;
$$;

drop trigger if exists prevent_referenced_trivia_question_delete on public.trivia_questions;

create trigger prevent_referenced_trivia_question_delete
  before delete on public.trivia_questions
  for each row execute procedure public.prevent_referenced_trivia_question_delete();

alter table public.news_articles
  drop constraint if exists news_articles_category_check;

alter table public.news_articles
  drop constraint if exists news_articles_competition_check;

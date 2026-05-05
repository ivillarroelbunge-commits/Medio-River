alter table public.news_articles
  add column if not exists image_focus_x numeric not null default 50,
  add column if not exists image_focus_y numeric not null default 50,
  add column if not exists image_zoom numeric not null default 1;

alter table public.news_articles
  drop constraint if exists news_articles_image_focus_x_range,
  drop constraint if exists news_articles_image_focus_y_range,
  drop constraint if exists news_articles_image_zoom_range;

alter table public.news_articles
  add constraint news_articles_image_focus_x_range check (image_focus_x >= 0 and image_focus_x <= 100),
  add constraint news_articles_image_focus_y_range check (image_focus_y >= 0 and image_focus_y <= 100),
  add constraint news_articles_image_zoom_range check (image_zoom >= 1 and image_zoom <= 2);

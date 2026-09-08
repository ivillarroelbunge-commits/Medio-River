-- Keep match-day status fresh enough for post-match rating articles to publish immediately.
select cron.unschedule('sync-promiedos-river-today');

select cron.schedule(
  'sync-promiedos-river-today',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://amftkabquesgzsurkols.supabase.co/functions/v1/sync-promiedos-river',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"mode":"today"}'::jsonb
  );
  $$
);

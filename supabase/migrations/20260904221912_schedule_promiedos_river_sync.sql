select cron.schedule(
  'sync-promiedos-river-today',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := 'https://amftkabquesgzsurkols.supabase.co/functions/v1/sync-promiedos-river',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"mode":"today"}'::jsonb
  );
  $$
);

select cron.schedule(
  'sync-promiedos-river-fixtures',
  '5 */6 * * *',
  $$
  select net.http_post(
    url := 'https://amftkabquesgzsurkols.supabase.co/functions/v1/sync-promiedos-river',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"mode":"fixtures"}'::jsonb
  );
  $$
);

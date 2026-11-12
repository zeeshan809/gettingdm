-- Follow before DM: check for "I've followed" taps every 10 seconds instead of once a
-- minute. The check runs inside Postgres, so the website is only called while someone
-- was prompted in the last 30 minutes; the minute job still covers older ones.
select cron.schedule(
  'gettingdm-follow-gate',
  '10 seconds',
  $job$
  select net.http_post(
    url := 'https://www.gettingdm.store/api/worker/dm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dm_worker_secret'), '')
    ),
    body := '{"only":"follow"}'::jsonb,
    timeout_milliseconds := 9000
  )
  where exists (
    select 1 from public.comment_events
    where status = 'awaiting_follow' and processed_at > now() - interval '30 minutes'
  );
  $job$
);

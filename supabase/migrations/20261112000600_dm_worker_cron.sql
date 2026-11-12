-- Runs the DM worker every minute: sends delayed DMs, retries failures and
-- picks up any webhook that wasn't processed right away.
-- Needs a Vault secret named 'dm_worker_secret' whose value matches the
-- DM_WORKER_SECRET environment variable in Vercel:
--   select vault.create_secret('<long random string>', 'dm_worker_secret');
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

select cron.schedule(
  'gettingdm-dm-worker',
  '* * * * *',
  $job$
  select net.http_post(
    url := 'https://gettingdm.store/api/worker/dm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'dm_worker_secret'), '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $job$
);

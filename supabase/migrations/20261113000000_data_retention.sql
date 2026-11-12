-- Data retention, as promised in the Privacy Policy and Data Deletion page.
-- Runs daily at 03:30 IST (22:00 UTC):
--   * raw Meta webhook deliveries (comments, messages): 30 days
--   * raw Razorpay webhook deliveries: 90 days
--   * comment and message records: 12 months
--   * storefront visit and click analytics: 24 months
create or replace function public.apply_data_retention()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.webhook_events where provider = 'meta' and received_at < now() - interval '30 days';
  delete from public.webhook_events where provider = 'razorpay' and received_at < now() - interval '90 days';
  delete from public.comment_events where received_at < now() - interval '12 months';
  delete from public.storefront_events where created_at < now() - interval '24 months';
$$;

revoke all on function public.apply_data_retention() from public, anon, authenticated;

select cron.schedule('gettingdm-data-retention', '0 22 * * *', $job$ select public.apply_data_retention(); $job$);

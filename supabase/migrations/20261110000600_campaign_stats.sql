-- Per-campaign counters for the campaign list and detail pages. Runs as the
-- caller, so RLS limits it to the creator's own campaigns.
create function public.campaign_stats(p_campaign_id uuid default null)
returns table (
  campaign_id uuid,
  comments bigint,
  eligible bigint,
  ineligible bigint,
  sent bigint,
  failed bigint,
  skipped bigint,
  visits bigint,
  clicks bigint
)
language sql stable security invoker set search_path = '' as $$
  select c.id,
    coalesce(e.comments, 0), coalesce(e.eligible, 0), coalesce(e.ineligible, 0),
    coalesce(e.sent, 0), coalesce(e.failed, 0), coalesce(e.skipped, 0),
    coalesce(s.visits, 0), coalesce(s.clicks, 0)
  from public.campaigns c
  left join lateral (
    select count(*) as comments,
      count(*) filter (where status in ('eligible', 'queued', 'processing', 'sent', 'failed')) as eligible,
      count(*) filter (where status = 'ineligible') as ineligible,
      count(*) filter (where status = 'sent') as sent,
      count(*) filter (where status = 'failed') as failed,
      count(*) filter (where status = 'skipped') as skipped
    from public.comment_events where campaign_id = c.id
  ) e on true
  left join lateral (
    select count(*) filter (where type = 'visit') as visits,
      count(*) filter (where type = 'click') as clicks
    from public.storefront_events where campaign_id = c.id
  ) s on true
  where p_campaign_id is null or c.id = p_campaign_id
$$;

revoke execute on function public.campaign_stats(uuid) from public, anon;
grant execute on function public.campaign_stats(uuid) to authenticated;

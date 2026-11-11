-- Creator dashboard and analytics. Days are Indian calendar days (IST); ranges
-- are inclusive dates. All functions run as the caller and filter to the
-- caller's own rows, so an admin session can't accidentally mix creators.

-- Upper bound on any range, so a crafted request can't scan forever.
create function public.ist_range(p_from date, p_to date, out lo timestamptz, out hi timestamptz)
language sql immutable set search_path = '' as $$
  select (p_from::timestamp at time zone 'Asia/Kolkata'),
         ((least(p_to, p_from + 400) + 1)::timestamp at time zone 'Asia/Kolkata')
$$;

create function public.creator_daily(p_from date, p_to date)
returns table (
  day date, comments bigint, eligible bigint, ineligible bigint, sent bigint,
  failed bigint, skipped bigint, visits bigint, uniques bigint, clicks bigint
)
language sql stable security invoker set search_path = '' as $$
  with r as (select * from public.ist_range(p_from, p_to)),
  days as (
    select generate_series(p_from, least(p_to, p_from + 400), interval '1 day')::date as day
  ),
  ce as (
    select (e.received_at at time zone 'Asia/Kolkata')::date as day,
      count(*) as comments,
      count(*) filter (where e.status in ('eligible', 'queued', 'processing', 'sent', 'failed')) as eligible,
      count(*) filter (where e.status = 'ineligible') as ineligible,
      count(*) filter (where e.status = 'sent') as sent,
      count(*) filter (where e.status = 'failed') as failed,
      count(*) filter (where e.status = 'skipped') as skipped
    from public.comment_events e, r
    where e.creator_id = (select auth.uid()) and e.received_at >= r.lo and e.received_at < r.hi
    group by 1
  ),
  se as (
    -- visitor_hash rotates daily, so distinct-per-day is the finest unique count.
    select (s.created_at at time zone 'Asia/Kolkata')::date as day,
      count(*) filter (where s.type = 'visit') as visits,
      count(distinct s.visitor_hash) filter (where s.type = 'visit') as uniques,
      count(*) filter (where s.type = 'click') as clicks
    from public.storefront_events s, r
    where s.creator_id = (select auth.uid()) and s.created_at >= r.lo and s.created_at < r.hi
    group by 1
  )
  select d.day,
    coalesce(ce.comments, 0), coalesce(ce.eligible, 0), coalesce(ce.ineligible, 0), coalesce(ce.sent, 0),
    coalesce(ce.failed, 0), coalesce(ce.skipped, 0),
    coalesce(se.visits, 0), coalesce(se.uniques, 0), coalesce(se.clicks, 0)
  from days d
  left join ce using (day)
  left join se using (day)
  order by d.day
$$;

create function public.keyword_stats(p_from date, p_to date)
returns table (keyword text, matches bigint, sent bigint)
language sql stable security invoker set search_path = '' as $$
  select upper(e.matched_keyword), count(*), count(*) filter (where e.status = 'sent')
  from public.comment_events e, public.ist_range(p_from, p_to) r
  where e.creator_id = (select auth.uid()) and e.matched_keyword is not null
    and e.received_at >= r.lo and e.received_at < r.hi
  group by 1
  order by 2 desc
  limit 20
$$;

create function public.link_stats(p_from date, p_to date)
returns table (campaign_id uuid, link_slot smallint, clicks bigint, unique_clicks bigint)
language sql stable security invoker set search_path = '' as $$
  select s.campaign_id, s.link_slot, count(*), count(distinct s.visitor_hash)
  from public.storefront_events s, public.ist_range(p_from, p_to) r
  where s.creator_id = (select auth.uid()) and s.type = 'click' and s.link_slot is not null
    and s.created_at >= r.lo and s.created_at < r.hi
  group by 1, 2
$$;

-- campaign_stats gains an optional date range (all time when omitted).
drop function public.campaign_stats(uuid);
create function public.campaign_stats(p_campaign_id uuid default null, p_from date default null, p_to date default null)
returns table (
  campaign_id uuid, comments bigint, eligible bigint, ineligible bigint, sent bigint,
  failed bigint, skipped bigint, visits bigint, clicks bigint
)
language sql stable security invoker set search_path = '' as $$
  with r as (
    select coalesce(lo, '-infinity'::timestamptz) as lo, coalesce(hi, 'infinity'::timestamptz) as hi
    from public.ist_range(p_from, p_to)
  )
  select c.id,
    coalesce(e.comments, 0), coalesce(e.eligible, 0), coalesce(e.ineligible, 0),
    coalesce(e.sent, 0), coalesce(e.failed, 0), coalesce(e.skipped, 0),
    coalesce(s.visits, 0), coalesce(s.clicks, 0)
  from public.campaigns c
  cross join r
  left join lateral (
    select count(*) as comments,
      count(*) filter (where status in ('eligible', 'queued', 'processing', 'sent', 'failed')) as eligible,
      count(*) filter (where status = 'ineligible') as ineligible,
      count(*) filter (where status = 'sent') as sent,
      count(*) filter (where status = 'failed') as failed,
      count(*) filter (where status = 'skipped') as skipped
    from public.comment_events
    where campaign_id = c.id and received_at >= r.lo and received_at < r.hi
  ) e on true
  left join lateral (
    select count(*) filter (where type = 'visit') as visits,
      count(*) filter (where type = 'click') as clicks
    from public.storefront_events
    where campaign_id = c.id and created_at >= r.lo and created_at < r.hi
  ) s on true
  where p_campaign_id is null or c.id = p_campaign_id
$$;

revoke execute on function public.creator_daily(date, date) from public, anon;
revoke execute on function public.keyword_stats(date, date) from public, anon;
revoke execute on function public.link_stats(date, date) from public, anon;
revoke execute on function public.campaign_stats(uuid, date, date) from public, anon;
grant execute on function public.creator_daily(date, date) to authenticated;
grant execute on function public.keyword_stats(date, date) to authenticated;
grant execute on function public.link_stats(date, date) to authenticated;
grant execute on function public.campaign_stats(uuid, date, date) to authenticated;

-- One live campaign per post, scoped to the creator. Real Instagram media ids
-- are already unique per account; this also keeps shared sample posts usable
-- by every creator in development.
drop index public.campaigns_one_active_per_media;
create unique index campaigns_one_active_per_media on public.campaigns (creator_id, ig_media_id) where active;

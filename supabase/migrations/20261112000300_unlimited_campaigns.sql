-- Active campaigns are now unlimited on every plan.
-- Removes the 5 (Creator) / 50 (Creator Plus) cap added in 20261110000000_init.sql.
drop trigger if exists enforce_campaign_limit on public.campaigns;
drop function if exists public.enforce_campaign_limit();

-- Unified Login: connections belong to the creator's Meta business portfolio
-- instead of a Facebook Page. fb_user_id now holds the system user id.
alter table public.instagram_accounts add column business_id text;

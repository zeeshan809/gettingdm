-- Campaign builder: which post a campaign watches, words that block a DM,
-- and optional public replies under the comment.

-- specific: one chosen post. any: every post and Reel. next: the next post the
-- creator publishes (locked to that post, as "specific", once its first comment arrives).
alter table public.campaigns
  add column post_scope text not null default 'specific' check (post_scope in ('specific', 'any', 'next')),
  add column exclude_keywords text[] not null default '{}',
  add column public_reply_enabled boolean not null default false,
  add column public_replies text[] not null default '{}';

alter table public.campaigns alter column ig_media_id drop not null;
alter table public.campaigns add constraint campaigns_media_matches_scope
  check ((post_scope = 'specific') = (ig_media_id is not null));

-- One live "any post" and one live "next post" campaign per creator.
create unique index campaigns_one_active_any on public.campaigns (creator_id) where active and post_scope = 'any';
create unique index campaigns_one_active_next on public.campaigns (creator_id) where active and post_scope = 'next';

-- Public reply status, shown in the automation log.
alter table public.comment_events add column public_reply_status text;

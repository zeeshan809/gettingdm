-- Delivery options for the comment-to-DM worker.
alter table public.campaigns
  add column delay_seconds integer not null default 0 check (delay_seconds between 0 and 86400),
  add column follow_required boolean not null default false;

-- Follow before DM: the first DM asks the commenter to reply; we check they
-- follow the creator before sending the link.
alter type public.automation_status add value if not exists 'awaiting_follow';

-- Looking up a commenter's open follow-gate conversation and duplicate DMs.
create index if not exists comment_events_commenter_idx
  on public.comment_events (creator_id, commenter_ig_id, received_at desc);

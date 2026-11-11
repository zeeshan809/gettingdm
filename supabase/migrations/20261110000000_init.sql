-- Initial schema: creators, storefront, campaigns, automation events, billing,
-- support and admin. Creator-owned rows are protected by RLS; anything holding
-- secrets or written by webhooks/workers is server-only (service role).

-- ---------- Enums ----------

create type public.plan_id as enum ('creator', 'creator_plus');
create type public.subscription_status as enum ('trial', 'active', 'payment_pending', 'past_due', 'cancelled', 'expired', 'suspended');
create type public.connection_status as enum ('connected', 'expired', 'revoked', 'error', 'disconnected');
create type public.match_rule as enum ('contains', 'exact', 'starts_with');
create type public.automation_status as enum ('received', 'processing', 'eligible', 'queued', 'sent', 'failed', 'skipped', 'ineligible');
create type public.ticket_status as enum ('open', 'in_progress', 'waiting', 'resolved', 'closed');
create type public.admin_role as enum ('super_admin', 'operations_admin', 'finance_admin', 'support_admin');
create type public.account_status as enum ('active', 'suspended');

-- ---------- Helpers ----------

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Keep in sync with RESERVED_USERNAMES in src/lib/config.ts.
create function public.is_reserved_username(u text) returns boolean
language sql immutable as $$
  select lower(u) = any (array[
    'admin', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'onboarding', 'dashboard',
    'campaigns', 'storefront', 'analytics', 'instagram', 'billing', 'support', 'settings', 'notifications',
    'api', 'pricing', 'auth', 'www', 'app', 'help', 'about', 'terms', 'privacy', 'static', 'assets'
  ])
$$;

-- ---------- Creators ----------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_.]{3,30}$' and not public.is_reserved_username(username)),
  full_name text not null default '' check (char_length(full_name) <= 80),
  email text not null,
  bio text not null default '' check (char_length(bio) <= 300),
  avatar_url text,
  theme jsonb not null default '{"brand": "#7c3aed", "button": "pill", "style": "light"}',
  socials jsonb not null default '[]',
  status public.account_status not null default 'active',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  creator_id uuid primary key references public.profiles (id) on delete cascade,
  plan public.plan_id not null default 'creator',
  status public.subscription_status not null default 'trial',
  -- Trial starts when the email is verified.
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  razorpay_customer_id text,
  razorpay_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Instagram ----------

create table public.instagram_accounts (
  creator_id uuid primary key references public.profiles (id) on delete cascade,
  ig_user_id text not null unique,
  username text not null,
  profile_picture_url text,
  account_type text,
  status public.connection_status not null default 'connected',
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_error text,
  updated_at timestamptz not null default now()
);

-- Encrypted tokens live apart so no client grant can ever expose them.
create table public.instagram_tokens (
  creator_id uuid primary key references public.instagram_accounts (creator_id) on delete cascade,
  access_token_encrypted text not null,
  updated_at timestamptz not null default now()
);

-- ---------- Storefront ----------

create table public.featured_links (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  title text not null check (char_length(title) between 1 and 60),
  description text not null default '' check (char_length(description) <= 120),
  url text not null check (url ~* '^https?://'),
  button_label text not null default 'Open' check (char_length(button_label) between 1 and 30),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, position)
);

-- Fourth link shown when a storefront is opened without a valid campaign.
create table public.storefront_default_links (
  creator_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text not null default '' check (char_length(description) <= 120),
  url text not null check (url ~* '^https?://'),
  button_label text not null default 'Open' check (char_length(button_label) between 1 and 30),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- Campaigns ----------

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  ig_media_id text not null,
  media_type text,
  media_caption text,
  media_thumbnail_url text,
  media_permalink text,
  media_posted_at timestamptz,
  keywords text[] not null check (cardinality(keywords) between 1 and 10),
  match_rule public.match_rule not null default 'contains',
  message text not null check (char_length(message) between 1 and 1000),
  cta_label text not null default 'Get it here' check (char_length(cta_label) between 1 and 30),
  link_title text not null check (char_length(link_title) between 1 and 60),
  link_description text not null default '' check (char_length(link_description) <= 120),
  link_url text not null check (link_url ~* '^https?://'),
  link_button_label text not null default 'Open' check (char_length(link_button_label) between 1 and 30),
  link_active boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index campaigns_creator_idx on public.campaigns (creator_id);
-- One live automation per post, so a comment never triggers two DMs.
create unique index campaigns_one_active_per_media on public.campaigns (ig_media_id) where active;

-- Webhook comments and their DM outcome; doubles as the DM job queue.
create table public.comment_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  ig_comment_id text not null unique,
  ig_media_id text not null,
  commenter_ig_id text,
  commenter_username text,
  comment_text text,
  matched_keyword text,
  status public.automation_status not null default 'received',
  attempts smallint not null default 0,
  next_attempt_at timestamptz,
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  sent_at timestamptz
);
create index comment_events_creator_idx on public.comment_events (creator_id, received_at desc);
create index comment_events_campaign_idx on public.comment_events (campaign_id);
create index comment_events_queue_idx on public.comment_events (next_attempt_at) where status = 'queued';

create table public.storefront_events (
  id bigint generated always as identity primary key,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  type text not null check (type in ('visit', 'click')),
  link_slot smallint check (link_slot between 1 and 4),
  visitor_hash text,
  referrer text,
  created_at timestamptz not null default now()
);
create index storefront_events_creator_idx on public.storefront_events (creator_id, created_at desc);
create index storefront_events_campaign_idx on public.storefront_events (campaign_id);

-- ---------- Billing ----------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  razorpay_payment_id text unique,
  razorpay_invoice_id text,
  razorpay_subscription_id text,
  plan public.plan_id,
  amount integer not null, -- paise
  currency text not null default 'INR',
  status text not null check (status in ('pending', 'captured', 'failed', 'refunded')),
  method text,
  failure_reason text,
  created_at timestamptz not null default now()
);
create index payments_creator_idx on public.payments (creator_id, created_at desc);

-- Idempotency log for Meta and Razorpay webhooks.
create table public.webhook_events (
  id text primary key,
  provider text not null check (provider in ('meta', 'razorpay')),
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

-- ---------- Notifications & support ----------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_creator_idx on public.notifications (creator_id, created_at desc);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 120),
  category text not null default 'general',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status public.ticket_status not null default 'open',
  assigned_admin uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_creator_idx on public.support_tickets (creator_id, created_at desc);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  from_admin boolean not null default false,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

-- ---------- Admin ----------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null,
  name text not null default '',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  admin_role public.admin_role,
  action text not null,
  target_type text,
  target_id text,
  reason text,
  detail jsonb not null default '{}',
  ip inet,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create function public.audit_logs_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_logs is append-only';
end $$;

create trigger audit_logs_no_update before update or delete on public.audit_logs
  for each row execute function public.audit_logs_immutable();

-- ---------- updated_at triggers ----------

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.instagram_accounts for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.instagram_tokens for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.featured_links for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.storefront_default_links for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();

-- ---------- Auth hooks ----------

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()))
$$;

create function public.username_available(u text) returns boolean
language sql stable security definer set search_path = '' as $$
  select u ~ '^[a-z0-9_.]{3,30}$'
    and not public.is_reserved_username(u)
    and not exists (select 1 from public.profiles where username = u)
$$;

-- Every creator sign-up gets a profile and a trial subscription. Admin accounts
-- are created server-side with app_metadata.kind = 'admin' and skip this.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_app_meta_data ->> 'kind' = 'admin' then
    return new;
  end if;

  insert into public.profiles (id, username, full_name, email)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'), coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);

  insert into public.subscriptions (creator_id, trial_start, trial_end)
  values (
    new.id,
    case when new.email_confirmed_at is not null then now() end,
    case when new.email_confirmed_at is not null then now() + interval '30 days' end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_confirmed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.subscriptions
  set trial_start = now(), trial_end = now() + interval '30 days'
  where creator_id = new.id and trial_start is null;
  return new;
end $$;

create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_user_confirmed();

-- Creator: 5 active campaigns, Creator Plus: 50.
create function public.enforce_campaign_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  max_active int;
  active_count int;
begin
  if not new.active or (tg_op = 'UPDATE' and old.active) then
    return new;
  end if;

  select case s.plan when 'creator_plus' then 50 else 5 end into max_active
  from public.subscriptions s where s.creator_id = new.creator_id;

  select count(*) into active_count
  from public.campaigns where creator_id = new.creator_id and active and id <> new.id;

  if active_count >= coalesce(max_active, 5) then
    raise exception 'Active campaign limit reached for your plan (%)', coalesce(max_active, 5) using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger enforce_campaign_limit before insert or update of active on public.campaigns
  for each row execute function public.enforce_campaign_limit();

-- ---------- Privileges ----------
-- Start from nothing for API roles, then grant exactly what the client needs.

revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_confirmed() from public, anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, username, bio, avatar_url, theme, socials, onboarding_completed) on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.instagram_accounts to authenticated;
grant select, insert, update, delete on public.featured_links to authenticated;
grant select, insert, update, delete on public.storefront_default_links to authenticated;
grant select, insert, update, delete on public.campaigns to authenticated;
grant select on public.comment_events to authenticated;
grant select on public.storefront_events to authenticated;
grant select on public.payments to authenticated;
grant select, update (read_at) on public.notifications to authenticated;
grant select, insert (creator_id, subject, category, priority) on public.support_tickets to authenticated;
grant select, insert (ticket_id, body) on public.ticket_messages to authenticated;
grant select on public.admin_users to authenticated;
grant select on public.audit_logs to authenticated;
-- instagram_tokens and webhook_events: service role only.

-- ---------- Row level security ----------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.instagram_accounts enable row level security;
alter table public.instagram_tokens enable row level security;
alter table public.featured_links enable row level security;
alter table public.storefront_default_links enable row level security;
alter table public.campaigns enable row level security;
alter table public.comment_events enable row level security;
alter table public.storefront_events enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

create policy "own or admin read" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "own update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own or admin read" on public.subscriptions for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "own or admin read" on public.instagram_accounts for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "own or admin read" on public.comment_events for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "own or admin read" on public.storefront_events for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "own or admin read" on public.payments for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));

create policy "admin read" on public.featured_links for select to authenticated
  using ((select public.is_admin()));
create policy "own all" on public.featured_links for all to authenticated
  using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));

create policy "admin read" on public.storefront_default_links for select to authenticated
  using ((select public.is_admin()));
create policy "own all" on public.storefront_default_links for all to authenticated
  using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));

create policy "admin read" on public.campaigns for select to authenticated
  using ((select public.is_admin()));
create policy "own all" on public.campaigns for all to authenticated
  using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));

create policy "own read" on public.notifications for select to authenticated
  using (creator_id = (select auth.uid()));
create policy "own mark read" on public.notifications for update to authenticated
  using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));

create policy "own or admin read" on public.support_tickets for select to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "own create" on public.support_tickets for insert to authenticated
  with check (creator_id = (select auth.uid()));

create policy "own or admin read" on public.ticket_messages for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.support_tickets t where t.id = ticket_id and t.creator_id = (select auth.uid()))
  );
create policy "own reply" on public.ticket_messages for insert to authenticated
  with check (
    author_id = (select auth.uid()) and not from_admin
    and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.creator_id = (select auth.uid()))
  );

create policy "self or admin read" on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admin read" on public.audit_logs for select to authenticated
  using ((select public.is_admin()));

-- Instagram connection via Facebook Login for Business (Unified login).

-- Keep in sync with RESERVED_USERNAMES in src/lib/config.ts.
create or replace function public.is_reserved_username(u text) returns boolean
language sql immutable set search_path = '' as $$
  select lower(u) = any (array[
    'admin', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'onboarding', 'dashboard',
    'campaigns', 'storefront', 'analytics', 'instagram', 'billing', 'support', 'settings', 'notifications',
    'api', 'pricing', 'auth', 'www', 'app', 'help', 'about', 'terms', 'privacy', 'data-deletion', 'static', 'assets'
  ])
$$;

-- The Meta user who connected, and the Facebook Page the Instagram account is linked to.
-- fb_user_id is how Meta's data-deletion and deauthorize callbacks identify the person.
alter table public.instagram_accounts
  add column fb_user_id text,
  add column page_id text,
  add column page_name text;
create index instagram_accounts_fb_user_idx on public.instagram_accounts (fb_user_id);

-- Requests from Meta's data-deletion callback; the code is shown on /data-deletion.
create table public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  fb_user_id text not null,
  creator_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);
-- Server-only: RLS on, no policies or grants for API roles.
alter table public.data_deletion_requests enable row level security;
grant all on public.data_deletion_requests to service_role;

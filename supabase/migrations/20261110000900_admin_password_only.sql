-- Admin sign-in is password-only for now (authenticator step removed).
-- Admin read access depends only on membership in admin_users.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()))
$$;

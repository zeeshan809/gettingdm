-- Admin read access only once the session has passed the authenticator code
-- (aal2), so a stolen admin password alone can't read creator data via the API.
-- The admin login page checks membership by reading its own admin_users row.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
$$;

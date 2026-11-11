-- Fixes from `supabase db advisors`.

alter function public.set_updated_at() set search_path = '';
alter function public.audit_logs_immutable() set search_path = '';
alter function public.is_reserved_username(text) set search_path = '';

-- Trigger-only function; never callable over the API.
revoke execute on function public.enforce_campaign_limit() from public, anon, authenticated;

-- One SELECT policy per table instead of "admin read" + "own all".
do $$
declare t text;
begin
  foreach t in array array['featured_links', 'storefront_default_links', 'campaigns'] loop
    execute format('drop policy "admin read" on public.%I', t);
    execute format('drop policy "own all" on public.%I', t);
    execute format($p$create policy "own or admin read" on public.%I for select to authenticated
      using (creator_id = (select auth.uid()) or (select public.is_admin()))$p$, t);
    execute format($p$create policy "own insert" on public.%I for insert to authenticated
      with check (creator_id = (select auth.uid()))$p$, t);
    execute format($p$create policy "own update" on public.%I for update to authenticated
      using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()))$p$, t);
    execute format($p$create policy "own delete" on public.%I for delete to authenticated
      using (creator_id = (select auth.uid()))$p$, t);
  end loop;
end $$;

-- Settings, notifications and support tickets.

-- ---------- Settings ----------

alter table public.profiles
  add column email_prefs jsonb not null default '{"failures": true, "trial": true, "connection": true, "weekly": false}';
grant update (email_prefs) on public.profiles to authenticated;

-- Keep profiles.email in step when the login email changes.
create function public.sync_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- ---------- Notifications ----------

alter table public.notifications
  add column tone text not null default 'info' check (tone in ('info', 'success', 'warning', 'danger'));

-- Server-side helper; never callable over the API.
create function public.notify(p_creator uuid, p_type text, p_tone text, p_title text, p_body text, p_link text default null)
returns void
language sql security definer set search_path = '' as $$
  insert into public.notifications (creator_id, type, tone, title, body, link)
  values (p_creator, p_type, p_tone, p_title, p_body, p_link)
$$;
revoke execute on function public.notify(uuid, text, text, text, text, text) from public, anon, authenticated;

create function public.welcome_notification() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.notify(new.id, 'welcome', 'success', 'Welcome to GettingDM 🎉',
    'Add your featured links, then create your first campaign to start replying to comments automatically.', '/storefront');
  return new;
end $$;

create trigger on_profile_created after insert on public.profiles
  for each row execute function public.welcome_notification();

-- Existing creators get the welcome too.
insert into public.notifications (creator_id, type, tone, title, body, link)
select id, 'welcome', 'success', 'Welcome to GettingDM 🎉',
  'Add your featured links, then create your first campaign to start replying to comments automatically.', '/storefront'
from public.profiles;

-- ---------- Support tickets ----------

alter table public.support_tickets
  add constraint support_tickets_category_check
  check (category in ('automation', 'instagram', 'storefront', 'billing', 'other', 'general'));

-- Ticket and first message in one go. Runs as the caller, so RLS applies.
create function public.create_support_ticket(p_subject text, p_category text, p_body text) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  ticket_id uuid;
begin
  insert into public.support_tickets (subject, category)
  values (trim(p_subject), p_category)
  returning id into ticket_id;

  insert into public.ticket_messages (ticket_id, body) values (ticket_id, trim(p_body));
  return ticket_id;
end $$;
revoke execute on function public.create_support_ticket(text, text, text) from public, anon;
grant execute on function public.create_support_ticket(text, text, text) to authenticated;

-- A creator reply reopens a ticket that was waiting on them or resolved.
-- An admin reply marks it waiting on the creator and notifies them.
create function public.on_ticket_message() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  t public.support_tickets;
begin
  select * into t from public.support_tickets where id = new.ticket_id;

  if new.from_admin then
    update public.support_tickets set status = 'waiting', updated_at = now() where id = t.id;
    perform public.notify(t.creator_id, 'support_reply', 'info', 'Support replied to your ticket',
      t.subject, '/support/' || t.id);
  else
    update public.support_tickets
    set status = case when status in ('waiting', 'resolved') then 'open'::public.ticket_status else status end,
        updated_at = now()
    where id = t.id;
  end if;
  return new;
end $$;

create trigger on_ticket_message_created after insert on public.ticket_messages
  for each row execute function public.on_ticket_message();

revoke execute on function public.sync_profile_email() from public, anon, authenticated;
revoke execute on function public.welcome_notification() from public, anon, authenticated;
revoke execute on function public.on_ticket_message() from public, anon, authenticated;

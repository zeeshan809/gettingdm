-- Auth's admin createUser writes app_metadata after the insert, so the trigger
-- can't see kind = 'admin'. Creator sign-ups always carry a username; accounts
-- without one (admins) get no creator profile. Admin rights still come only
-- from admin_users, so skipping the profile grants nothing.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'username', '') = '' then
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

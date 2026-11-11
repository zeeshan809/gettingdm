-- Storefront editor: cover image and a single atomic save for profile,
-- featured links and the default fourth link.

alter table public.profiles add column cover_url text;
grant update (cover_url) on public.profiles to authenticated;

-- Runs as the caller, so RLS and column grants still apply.
create function public.save_storefront(p_profile jsonb, p_links jsonb, p_default jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  update public.profiles
  set full_name = p_profile ->> 'full_name',
      username = p_profile ->> 'username',
      bio = p_profile ->> 'bio',
      theme = p_profile -> 'theme',
      socials = p_profile -> 'socials'
  where id = uid;

  delete from public.featured_links where creator_id = uid;
  insert into public.featured_links (creator_id, position, title, description, url, button_label, active)
  select uid, (x ->> 'position')::smallint, x ->> 'title', x ->> 'description', x ->> 'url', x ->> 'button_label', (x ->> 'active')::boolean
  from jsonb_array_elements(p_links) x;

  if p_default is null or jsonb_typeof(p_default) = 'null' then
    delete from public.storefront_default_links where creator_id = uid;
  else
    insert into public.storefront_default_links (creator_id, title, description, url, button_label, active)
    values (uid, p_default ->> 'title', p_default ->> 'description', p_default ->> 'url', p_default ->> 'button_label', (p_default ->> 'active')::boolean)
    on conflict (creator_id) do update
    set title = excluded.title, description = excluded.description, url = excluded.url,
        button_label = excluded.button_label, active = excluded.active;
  end if;
end $$;

revoke execute on function public.save_storefront(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_storefront(jsonb, jsonb, jsonb) to authenticated;

-- "Any comment" campaigns reply to every comment on the post, so they need no keywords.
alter type public.match_rule add value if not exists 'any';

-- Keyword campaigns still need 1–10 keywords; "any" campaigns may have none.
-- Compares as text so the new enum value isn't used in the same transaction it's added.
alter table public.campaigns drop constraint campaigns_keywords_check;
alter table public.campaigns add constraint campaigns_keywords_check check (
  cardinality(keywords) <= 10
  and (match_rule::text = 'any' or cardinality(keywords) >= 1)
);

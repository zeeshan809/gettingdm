import { getCurrentCreator } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toStoreLink } from "@/lib/storefront-server";
import { emptyLink, parseSocials, parseTheme, type CampaignOption, type FeaturedLink } from "@/lib/storefront";
import { StorefrontEditor } from "./storefront-editor";

export default async function StorefrontPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();

  const [{ data: p }, { data: links }, { data: def }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("full_name, username, bio, avatar_url, cover_url, theme, socials").eq("id", creator.id).single(),
    supabase.from("featured_links").select("position, title, description, url, button_label, active").eq("creator_id", creator.id),
    supabase.from("storefront_default_links").select("title, description, url, button_label, active").eq("creator_id", creator.id).maybeSingle(),
    supabase
      .from("campaigns")
      .select("id, name, active, link_title, link_description, link_url, link_button_label, link_active")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false }),
  ]);

  // Always three slots, so empty ones can be filled in the editor.
  const featured: FeaturedLink[] = ([1, 2, 3] as const).map((position) => {
    const row = links?.find((l) => l.position === position);
    return { ...(row ? toStoreLink(row) : emptyLink()), position };
  });

  const campaignOptions: CampaignOption[] = (campaigns ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    active: c.active,
    link: { title: c.link_title, description: c.link_description, url: c.link_url, buttonLabel: c.link_button_label, active: c.link_active },
  }));

  return (
    <StorefrontEditor
      initialProfile={{
        name: p?.full_name ?? "",
        username: p?.username ?? creator.username,
        bio: p?.bio ?? "",
        avatarUrl: p?.avatar_url ?? null,
        coverUrl: p?.cover_url ?? null,
        theme: parseTheme(p?.theme),
        socials: parseSocials(p?.socials),
      }}
      initialFeatured={featured}
      initialFallback={def ? toStoreLink(def) : { ...emptyLink(), active: false }}
      campaigns={campaignOptions}
    />
  );
}

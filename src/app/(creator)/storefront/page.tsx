import { Check, Store } from "lucide-react";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { hasStorefront } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";
import { toStoreLink } from "@/lib/storefront-server";
import { emptyLink, parseSocials, parseTheme, type CampaignOption, type FeaturedLink } from "@/lib/storefront";
import { StorefrontEditor } from "./storefront-editor";

export default async function StorefrontPage() {
  const creator = await getCurrentCreator();
  if (!hasStorefront(creator.subscription)) return <StorefrontLocked />;
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

// Creator (Rs 99) plan: the storefront is a Creator Plus feature.
function StorefrontLocked() {
  const perks = [
    "Your own page at gettingdm.store/you with photo, bio and socials",
    "Three fixed links that every follower sees",
    "A fourth link that changes for each campaign",
    "Visits and clicks for every link in analytics",
  ];
  return (
    <>
      <PageHeader title="Storefront" description="A link-in-bio page your DMs can point to." />
      <Card className="mx-auto max-w-xl overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-pink-400 px-6 py-8 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20"><Store className="h-6 w-6" /></span>
          <h2 className="mt-4 text-xl font-semibold">Storefront is part of Creator Plus</h2>
          <p className="mt-1 text-sm text-violet-50">On your current plan, DMs link straight to each campaign&apos;s link.</p>
        </div>
        <div className="p-6">
          <ul className="space-y-3 text-sm">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />{p}</li>
            ))}
          </ul>
          <LinkButton href="/billing" size="lg" className="mt-6 w-full">Upgrade to Creator Plus</LinkButton>
        </div>
      </Card>
    </>
  );
}

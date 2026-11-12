import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { hasStorefront } from "./plan";
import { createServiceClient } from "./supabase/server";
import {
  parseSocials, parseTheme, USERNAME_RE, UUID_RE,
  type FeaturedLink, type FourthLink, type StoreLink, type StoreProfile,
} from "./storefront";

type LinkRow = { title: string; description: string; url: string; button_label: string; active: boolean };
export const toStoreLink = (r: LinkRow): StoreLink => ({
  title: r.title, description: r.description, url: r.url, buttonLabel: r.button_label, active: r.active,
});

// Public storefront per PRD §7.4: only the campaign id comes from the URL. It must
// belong to this creator and be live, otherwise the default fourth link is shown.
// Link URLs always come from stored data. Uses the service role (visitors are anonymous).
export const getPublicStorefront = cache(async (username: string, campaignParam?: string) => {
  const handle = username.toLowerCase();
  if (!USERNAME_RE.test(handle)) return null;

  const svc = createServiceClient();
  const { data: p } = await svc
    .from("profiles")
    .select(`id, username, full_name, bio, avatar_url, cover_url, theme, socials, status,
      featured_links (position, title, description, url, button_label, active),
      storefront_default_links (title, description, url, button_label, active),
      subscriptions (plan, status)`)
    .eq("username", handle)
    .maybeSingle();
  if (!p || p.status !== "active") return null;

  let fourth: FourthLink | null = null;
  let campaignId: string | null = null;
  if (campaignParam && UUID_RE.test(campaignParam)) {
    const { data: c } = await svc
      .from("campaigns")
      .select("id, link_title, link_description, link_url, link_button_label")
      .eq("id", campaignParam)
      .eq("creator_id", p.id)
      .eq("active", true)
      .eq("link_active", true)
      .maybeSingle();
    if (c) {
      campaignId = c.id;
      fourth = {
        title: c.link_title, description: c.link_description, url: c.link_url,
        buttonLabel: c.link_button_label, active: true, source: "campaign",
      };
    }
  }
  const def = p.storefront_default_links;
  if (!fourth && def?.active) fourth = { ...toStoreLink(def), source: "default" };

  const profile: StoreProfile = {
    name: p.full_name || p.username,
    username: p.username,
    bio: p.bio,
    avatarUrl: p.avatar_url,
    coverUrl: p.cover_url,
    theme: parseTheme(p.theme),
    socials: parseSocials(p.socials),
  };
  const featured: FeaturedLink[] = p.featured_links
    .filter((l) => l.active)
    .sort((a, b) => a.position - b.position)
    .map((l) => ({ ...toStoreLink(l), position: l.position as 1 | 2 | 3 }));

  // Creator (Rs 99) accounts have no public storefront; their DMs link straight to the campaign link.
  const storefrontEnabled = hasStorefront(p.subscriptions);

  return { creatorId: p.id, profile, featured, fourth, campaignId, storefrontEnabled };
});

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse/i;

// Visits and clicks for analytics. Visitors are counted by a daily salted hash
// of IP + user agent, so no IP is stored. Bots are skipped. The insert runs
// after the response is sent so it never slows the page or redirect.
export async function trackStorefrontEvent(event: {
  creatorId: string;
  campaignId: string | null;
  type: "visit" | "click";
  slot?: number;
}) {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return;
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash("sha256").update(`${process.env.ANALYTICS_SALT}|${day}|${ip}|${ua}`).digest("hex");
  const referrer = event.type === "visit" ? h.get("referer")?.slice(0, 500) ?? null : null;

  after(async () => {
    await createServiceClient().from("storefront_events").insert({
      creator_id: event.creatorId,
      campaign_id: event.campaignId,
      type: event.type,
      link_slot: event.slot ?? null,
      visitor_hash: visitorHash,
      referrer,
    });
  });
}

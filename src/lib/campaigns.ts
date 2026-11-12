// Campaign types and validation shared by the form and its server actions.
import type { MatchRule } from "./keywords";
import { isHttpUrl, type StoreLink } from "./storefront";

export type InstagramMedia = {
  id: string;
  type: "Reel" | "Post";
  caption: string;
  thumbnailUrl: string | null;
  permalink: string | null;
  postedAt: string;
};

export type CampaignInput = {
  name: string;
  mediaId: string;
  keywords: string[];
  matchRule: MatchRule;
  message: string;
  cta: string;
  link: StoreLink;
  active: boolean;
};

export type CampaignStats = {
  comments: number; eligible: number; ineligible: number; sent: number;
  failed: number; skipped: number; visits: number; clicks: number;
};

export const EMPTY_STATS: CampaignStats = { comments: 0, eligible: 0, ineligible: 0, sent: 0, failed: 0, skipped: 0, visits: 0, clicks: 0 };

export const MESSAGE_MAX = 640;
export const CTA_MAX = 20;
export const KEYWORDS_MAX = 10;
export const KEYWORD_MAX_LENGTH = 30;

export const normalizeKeyword = (k: string) => k.trim().toUpperCase().replace(/\s+/g, " ");

// What triggers a campaign, for lists: its keywords, or "Any comment".
export const triggerLabels = (rule: MatchRule, keywords: string[]) => (rule === "any" ? ["Any comment"] : keywords);

export function validateCampaign(c: CampaignInput): string | null {
  if (!c.name.trim()) return "Give your campaign a name.";
  if (c.name.length > 80) return "Campaign name must be 80 characters or fewer.";
  if (!c.mediaId) return "Pick the post or Reel this campaign watches.";
  if (c.matchRule !== "any" && c.keywords.length === 0) return "Add at least one keyword, or choose \"Any comment\".";
  if (c.keywords.length > KEYWORDS_MAX) return `Up to ${KEYWORDS_MAX} keywords per campaign.`;
  if (c.keywords.some((k) => !k || k.length > KEYWORD_MAX_LENGTH)) return `Keywords must be 1–${KEYWORD_MAX_LENGTH} characters.`;
  if (!["contains", "exact", "starts_with", "any"].includes(c.matchRule)) return "Pick a matching rule.";
  if (!c.message.trim()) return "Write the DM message.";
  if (c.message.length > MESSAGE_MAX) return `Message must be ${MESSAGE_MAX} characters or fewer.`;
  if (c.cta.length > CTA_MAX) return `Button text must be ${CTA_MAX} characters or fewer.`;
  if (!c.link.title.trim()) return "Give the campaign link a title.";
  if (c.link.title.length > 60) return "Link title must be 60 characters or fewer.";
  if (c.link.description.length > 120) return "Link description must be 120 characters or fewer.";
  if (c.link.buttonLabel.length > 30) return "Link button text must be 30 characters or fewer.";
  if (!isHttpUrl(c.link.url.trim())) return "Enter a full link URL starting with https://";
  return null;
}

// Stable gradient for posts without a thumbnail.
export function mediaHue(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

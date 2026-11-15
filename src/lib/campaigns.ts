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

// Which post a campaign watches: one chosen post, every post, or the next one published.
export type PostScope = "specific" | "any" | "next";

export const POST_SCOPES: { id: PostScope; label: string; help: string }[] = [
  { id: "specific", label: "Specific post", help: "Pick one post or Reel." },
  { id: "any", label: "Any post", help: "Every post and Reel, now and in future." },
  { id: "next", label: "Next post", help: "The next post or Reel you publish." },
];

export type CampaignInput = {
  name: string;
  postScope: PostScope;
  mediaId: string;
  keywords: string[];
  matchRule: MatchRule;
  message: string;
  cta: string;
  link: StoreLink;
  active: boolean;
  delaySeconds: number;
  followRequired: boolean;
  excludeKeywords: string[];
  publicReplyEnabled: boolean;
  publicReplies: string[];
};

// "Delay message": when the DM goes out after the comment. The worker runs every minute.
export const DELAY_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: 0, label: "Instantly" },
  { seconds: 60, label: "After 1 minute" },
  { seconds: 300, label: "After 5 minutes" },
  { seconds: 900, label: "After 15 minutes" },
  { seconds: 3600, label: "After 1 hour" },
];

export type CampaignStats = {
  comments: number; eligible: number; ineligible: number; sent: number;
  failed: number; skipped: number; visits: number; clicks: number;
};

export const EMPTY_STATS: CampaignStats = { comments: 0, eligible: 0, ineligible: 0, sent: 0, failed: 0, skipped: 0, visits: 0, clicks: 0 };

export const MESSAGE_MAX = 640;
export const CTA_MAX = 20;
export const KEYWORDS_MAX = 10;
export const KEYWORD_MAX_LENGTH = 30;
export const PUBLIC_REPLIES_MAX = 5;
export const PUBLIC_REPLY_MAX = 300;

export const normalizeKeyword = (k: string) => k.trim().toUpperCase().replace(/\s+/g, " ");

// What triggers a campaign, for lists: its keywords, or "Any comment".
export const triggerLabels = (rule: MatchRule, keywords: string[]) => (rule === "any" ? ["Any comment"] : keywords);

export function validateCampaign(c: CampaignInput): string | null {
  if (!c.name.trim()) return "Give your campaign a name.";
  if (c.name.length > 80) return "Campaign name must be 80 characters or fewer.";
  if (!POST_SCOPES.some((p) => p.id === c.postScope)) return "Choose which posts this campaign watches.";
  if (c.postScope === "specific" && !c.mediaId) return "Pick the post or Reel this campaign watches.";
  if (c.matchRule !== "any" && c.keywords.length === 0) return "Add at least one keyword, or choose \"Any comment\".";
  if (c.keywords.length > KEYWORDS_MAX) return `Up to ${KEYWORDS_MAX} keywords per campaign.`;
  if (c.keywords.some((k) => !k || k.length > KEYWORD_MAX_LENGTH)) return `Keywords must be 1–${KEYWORD_MAX_LENGTH} characters.`;
  if (!["contains", "exact", "starts_with", "any"].includes(c.matchRule)) return "Pick a matching rule.";
  if (c.excludeKeywords.length > KEYWORDS_MAX) return `Up to ${KEYWORDS_MAX} excluded words per campaign.`;
  if (c.excludeKeywords.some((k) => !k || k.length > KEYWORD_MAX_LENGTH)) return `Excluded words must be 1–${KEYWORD_MAX_LENGTH} characters.`;
  if (c.publicReplyEnabled) {
    const replies = c.publicReplies.map((r) => r.trim()).filter(Boolean);
    if (!replies.length) return "Add at least one public reply, or turn public replies off.";
    if (replies.length > PUBLIC_REPLIES_MAX) return `Up to ${PUBLIC_REPLIES_MAX} public replies.`;
    if (replies.some((r) => r.length > PUBLIC_REPLY_MAX)) return `Each public reply must be ${PUBLIC_REPLY_MAX} characters or fewer.`;
  }
  if (!c.message.trim()) return "Write the DM message.";
  if (c.message.length > MESSAGE_MAX) return `Message must be ${MESSAGE_MAX} characters or fewer.`;
  if (c.cta.length > CTA_MAX) return `Button text must be ${CTA_MAX} characters or fewer.`;
  if (c.link.title.length > 60) return "Link title must be 60 characters or fewer.";
  if (c.link.description.length > 120) return "Link description must be 120 characters or fewer.";
  if (c.link.buttonLabel.length > 30) return "Link button text must be 30 characters or fewer.";
  if (!isHttpUrl(c.link.url.trim())) return "Enter a full link URL starting with https://";
  if (!DELAY_OPTIONS.some((d) => d.seconds === c.delaySeconds)) return "Pick when the DM should be sent.";
  return null;
}

// Stable gradient for posts without a thumbnail.
export function mediaHue(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

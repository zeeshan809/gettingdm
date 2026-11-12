// Storefront types and validation shared by the editor, its server action and
// the public page. Pure: safe to import on client and server.
import { RESERVED_USERNAMES } from "./config";

export type Theme = { brand: string; button: "pill" | "rounded" | "square"; style: "light" | "dark" };
export type Social = { platform: string; url: string };

export type StoreProfile = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: Theme;
  socials: Social[];
};

export type StoreLink = { title: string; description: string; url: string; buttonLabel: string; active: boolean };
export type FeaturedLink = StoreLink & { position: 1 | 2 | 3 };
export type FourthLink = StoreLink & { source: "campaign" | "default" };
export type CampaignOption = { id: string; name: string; active: boolean; link: StoreLink };

export type StorefrontInput = {
  profile: Pick<StoreProfile, "name" | "username" | "bio" | "theme" | "socials">;
  featured: FeaturedLink[];
  fallback: StoreLink;
};

export const SOCIAL_PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "X", "Telegram", "WhatsApp", "Website"];
export const BIO_MAX = 160;
export const DEFAULT_THEME: Theme = { brand: "#3f79c9", button: "pill", style: "light" };
export const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const emptyLink = (): StoreLink => ({ title: "", description: "", url: "", buttonLabel: "Open", active: true });

export function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// DB jsonb is untrusted shape-wise; fall back to defaults field by field.
export function parseTheme(value: unknown): Theme {
  const t = (value ?? {}) as Partial<Theme>;
  return {
    brand: typeof t.brand === "string" && /^#[0-9a-f]{6}$/i.test(t.brand) ? t.brand : DEFAULT_THEME.brand,
    button: t.button === "rounded" || t.button === "square" ? t.button : "pill",
    style: t.style === "dark" ? "dark" : "light",
  };
}

export function parseSocials(value: unknown): Social[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Social => typeof s?.platform === "string" && typeof s?.url === "string" && isHttpUrl(s.url))
    .map(({ platform, url }) => ({ platform, url }));
}

function linkError(link: StoreLink, label: string) {
  const empty = !link.title.trim() && !link.url.trim();
  if (empty) return null;
  if (!link.title.trim()) return `${label}: add a title.`;
  if (link.title.length > 60) return `${label}: title must be 60 characters or fewer.`;
  if (!isHttpUrl(link.url.trim())) return `${label}: enter a full URL starting with https://`;
  if (link.description.length > 120) return `${label}: description must be 120 characters or fewer.`;
  if (link.buttonLabel.length > 30) return `${label}: button label must be 30 characters or fewer.`;
  return null;
}

export function validateStorefront({ profile, featured, fallback }: StorefrontInput): string | null {
  if (!USERNAME_RE.test(profile.username)) return "Username must be 3–30 characters: letters, numbers, dots and underscores.";
  if (RESERVED_USERNAMES.includes(profile.username)) return "That username is reserved.";
  if (profile.name.length > 80) return "Display name must be 80 characters or fewer.";
  if (profile.bio.length > BIO_MAX) return `Bio must be ${BIO_MAX} characters or fewer.`;
  if (!/^#[0-9a-f]{6}$/i.test(profile.theme.brand)) return "Pick a valid brand colour.";
  if (profile.socials.length > 10) return "Up to 10 social links.";
  for (const s of profile.socials) {
    if (!SOCIAL_PLATFORMS.includes(s.platform)) return "Unknown social platform.";
    if (!isHttpUrl(s.url.trim())) return `${s.platform}: enter a full URL starting with https://`;
  }
  for (const l of featured) {
    const err = linkError(l, `Link ${l.position}`);
    if (err) return err;
  }
  return linkError(fallback, "Default fourth link");
}

// Stable avatar colour from the username, for creators without a photo.
export function avatarHue(username: string) {
  let h = 0;
  for (const ch of username) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

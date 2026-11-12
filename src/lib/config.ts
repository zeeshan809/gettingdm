// Product name and domain — change here and it updates everywhere.
export const APP_NAME = "GettingDM";
export const APP_DOMAIN = "gettingdm.store";
// Shown on the privacy, terms and data-deletion pages.
export const SUPPORT_EMAIL = "support@gettingdm.store";
export const LEGAL_UPDATED = "12 November 2026";

export const TRIAL_DAYS = 30;

export type PlanId = "creator" | "creator_plus";

// Features marked `soon` are on the roadmap and shown with a "Coming soon" badge.
// Only list a feature as included once it actually works.
type PlanFeature = { label: string; value: string; soon?: boolean };

const COMING_SOON: PlanFeature[] = [
  "Story reply",
  "Follow before DM",
  "Delay message",
  "Collect email",
  "AI assistant",
  "Re-engage past leads",
].map((label) => ({ label, value: "Included", soon: true }));

export const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  features: PlanFeature[];
}[] = [
  {
    id: "creator",
    name: "Creator",
    price: 99,
    tagline: "Turn every comment into a DM, automatically.",
    features: [
      { label: "Instagram connection", value: "Included" },
      { label: "Comment-to-DM automation", value: "Included" },
      { label: "Instant DM within seconds", value: "Included" },
      { label: "Unlimited DMs and auto replies", value: "Included" },
      { label: "Unlimited contacts", value: "Included" },
      { label: "Active campaigns", value: "Unlimited" },
      { label: "Basic analytics", value: "Included" },
      { label: "Support", value: "Priority" },
      ...COMING_SOON,
    ],
  },
  {
    id: "creator_plus",
    name: "Creator Plus",
    price: 299,
    tagline: "DM automation plus your own link storefront.",
    features: [
      { label: "Everything in Creator", value: "Included" },
      { label: "Mini-storefront", value: "Included" },
      { label: "Three global links", value: "Included" },
      { label: "Campaign-specific fourth link", value: "Included" },
      { label: "Advanced analytics", value: "Included" },
      ...COMING_SOON,
    ],
  },
];

// Usernames that would collide with app routes.
export const RESERVED_USERNAMES = [
  "admin", "login", "register", "forgot-password", "reset-password", "verify-email", "onboarding", "dashboard",
  "campaigns", "storefront", "analytics", "instagram", "billing", "support",
  "settings", "notifications", "api", "pricing", "auth", "www", "app", "help", "about",
  "terms", "privacy", "data-deletion", "static", "assets",
];

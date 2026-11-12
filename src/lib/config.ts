// Product name and domain — change here and it updates everywhere.
export const APP_NAME = "GettingDM";
export const APP_DOMAIN = "gettingdm.store";
// Shown on the privacy, terms and data-deletion pages.
export const SUPPORT_EMAIL = "support@gettingdm.store";
export const LEGAL_UPDATED = "13 November 2026";
// The business behind the service, as on your Meta Business Verification documents.
// Fill these in once known; the legal pages show them when set.
export const BUSINESS_LEGAL_NAME = "";
export const BUSINESS_ADDRESS = "";

export const TRIAL_DAYS = 30;

export type PlanId = "creator" | "creator_plus";

// Only list a feature once it actually works. `soon` marks roadmap items (shown as "Coming soon").
// `highlight` marks a plan's headline features (shown in their own box on top).
type PlanFeature = { label: string; value: string; soon?: boolean; highlight?: boolean };

const CREATOR_FEATURES: PlanFeature[] = [
  { label: "Instagram connection", value: "Included" },
  { label: "Comment-to-DM automation", value: "Included" },
  { label: "Instant DM within seconds", value: "Included" },
  { label: "Follow before DM", value: "Included" },
  { label: "Delay message", value: "Included" },
  { label: "Unlimited DMs and auto replies", value: "Included" },
  { label: "Unlimited contacts", value: "Included" },
  { label: "Active campaigns", value: "Unlimited" },
  { label: "Basic analytics", value: "Included" },
  { label: "Support", value: "Priority" },
];

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
    features: CREATOR_FEATURES,
  },
  {
    id: "creator_plus",
    name: "Creator Plus",
    price: 299,
    tagline: "DM automation plus your own link storefront.",
    features: [
      { label: "Mini-storefront", value: "Included", highlight: true },
      { label: "Three global links", value: "Included", highlight: true },
      { label: "Campaign-specific fourth link", value: "Included", highlight: true },
      // Everything in Creator, with full analytics instead of basic.
      ...CREATOR_FEATURES.map((f) => (f.label === "Basic analytics" ? { label: "Advanced analytics", value: "Included" } : f)),
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

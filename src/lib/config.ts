// Placeholder product name — change here and it updates everywhere.
export const APP_NAME = "LinkLoop";
export const APP_DOMAIN = "linkloop.in";

export const TRIAL_DAYS = 30;

export type PlanId = "creator" | "creator_plus";

export const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  features: { label: string; value: string }[];
}[] = [
  {
    id: "creator",
    name: "Creator",
    price: 99,
    tagline: "Everything you need to automate DMs and share links.",
    features: [
      { label: "Instagram connection", value: "Included" },
      { label: "Comment-to-DM automation", value: "Included" },
      { label: "Mini-storefront", value: "Included" },
      { label: "Three global links", value: "Included" },
      { label: "Campaign-specific fourth link", value: "Included" },
      { label: "Basic analytics", value: "Included" },
      { label: "Advanced analytics", value: "Limited" },
      { label: "Active campaigns", value: "Up to 5" },
      { label: "Support", value: "Standard" },
    ],
  },
  {
    id: "creator_plus",
    name: "Creator Plus",
    price: 399,
    tagline: "For creators running many campaigns at once.",
    features: [
      { label: "Instagram connection", value: "Included" },
      { label: "Comment-to-DM automation", value: "Included" },
      { label: "Mini-storefront", value: "Included" },
      { label: "Three global links", value: "Included" },
      { label: "Campaign-specific fourth link", value: "Included" },
      { label: "Basic analytics", value: "Included" },
      { label: "Advanced analytics", value: "Included" },
      { label: "Active campaigns", value: "Up to 50" },
      { label: "Support", value: "Priority" },
    ],
  },
];

// Usernames that would collide with app routes.
export const RESERVED_USERNAMES = [
  "admin", "login", "register", "forgot-password", "reset-password", "verify-email", "onboarding", "dashboard",
  "campaigns", "storefront", "analytics", "instagram", "billing", "support",
  "settings", "notifications", "api", "pricing", "auth", "www", "app", "help", "about",
  "terms", "privacy", "static", "assets",
];

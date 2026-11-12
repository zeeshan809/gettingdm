import { APP_DOMAIN, type PlanId } from "./config";

// Single source of truth for what each plan unlocks.
// Free trial: everything. Creator (Rs 99): DM automation only.
// Creator Plus (Rs 299): DM automation plus the storefront and its links.

type Sub = { plan: PlanId | string; status: string } | null | undefined;

// Razorpay reports "cancelled" only once the last paid period is over.
const ENDED = ["cancelled", "expired", "suspended"];

export function hasStorefront(sub: Sub) {
  if (!sub) return false;
  if (sub.status === "trial") return true;
  return sub.plan === "creator_plus" && !ENDED.includes(sub.status);
}

// The link the comment-to-DM worker puts in each DM.
// With a storefront: the storefront page with this campaign's link as the fourth button.
// Without: a click-tracked redirect straight to the campaign's own link.
export function dmLinkFor({ username, campaignId, storefront }: { username: string; campaignId: string; storefront: boolean }) {
  return storefront
    ? `https://${APP_DOMAIN}/${username}?campaign=${campaignId}`
    : `https://${APP_DOMAIN}/go/${username}/dm?campaign=${campaignId}`;
}

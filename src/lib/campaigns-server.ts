import "server-only";
import { createClient } from "./supabase/server";
import { EMPTY_STATS, type CampaignStats } from "./campaigns";

// All-time by default; pass inclusive IST dates to limit to a range.
export async function getCampaignStats(campaignId?: string, range?: { from: string; to: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("campaign_stats", {
    ...(campaignId && { p_campaign_id: campaignId }),
    ...(range && { p_from: range.from, p_to: range.to }),
  });
  const byId = new Map<string, CampaignStats>();
  for (const { campaign_id, ...s } of data ?? []) byId.set(campaign_id, s);
  return (id: string) => byId.get(id) ?? EMPTY_STATS;
}

import "server-only";
import { createClient } from "./supabase/server";
import { getCampaignStats } from "./campaigns-server";
import type { ResolvedRange } from "./date-range";

export type DailyRow = {
  date: string; comments: number; eligible: number; ineligible: number; sent: number;
  failed: number; skipped: number; visits: number; uniques: number; clicks: number;
};
export type Totals = Omit<DailyRow, "date">;

const ZERO: Totals = { comments: 0, eligible: 0, ineligible: 0, sent: 0, failed: 0, skipped: 0, visits: 0, uniques: 0, clicks: 0 };

export function sumRows(rows: DailyRow[]): Totals {
  return rows.reduce((t, r) => {
    const next = { ...t };
    for (const k of Object.keys(ZERO) as (keyof Totals)[]) next[k] += r[k];
    return next;
  }, ZERO);
}

// One query covers the range and the period before it (for deltas).
export async function getDaily(range: ResolvedRange) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("creator_daily", { p_from: range.prevFrom, p_to: range.to });
  const rows: DailyRow[] = (data ?? []).map(({ day, ...r }) => ({ date: day, ...r }));
  return {
    rows: rows.filter((r) => r.date >= range.from),
    prevTotals: sumRows(rows.filter((r) => r.date < range.from)),
  };
}

export async function getCampaignTable(creatorId: string, range: ResolvedRange) {
  const supabase = await createClient();
  const [{ data }, statsFor] = await Promise.all([
    supabase.from("campaigns").select("id, name, active, keywords").eq("creator_id", creatorId)
      .order("active", { ascending: false }).order("created_at", { ascending: false }),
    getCampaignStats(undefined, range),
  ]);
  return (data ?? []).map((c) => ({ ...c, stats: statsFor(c.id) }));
}

export async function getKeywordStats(range: ResolvedRange) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("keyword_stats", { p_from: range.from, p_to: range.to });
  return data ?? [];
}

export type LinkStat = { name: string; type: "Campaign" | "Global" | "Default"; clicks: number; uniques: number };

// Names are the links' current titles; slot 1–3 = featured, slot 4 = campaign
// link (with a campaign) or the default fourth link (without).
export async function getLinkStats(creatorId: string, range: ResolvedRange): Promise<LinkStat[]> {
  const supabase = await createClient();
  const [{ data: stats }, { data: featured }, { data: def }, { data: campaigns }] = await Promise.all([
    supabase.rpc("link_stats", { p_from: range.from, p_to: range.to }),
    supabase.from("featured_links").select("position, title").eq("creator_id", creatorId),
    supabase.from("storefront_default_links").select("title").eq("creator_id", creatorId).maybeSingle(),
    supabase.from("campaigns").select("id, link_title").eq("creator_id", creatorId),
  ]);

  const out = new Map<string, LinkStat>();
  for (const s of stats ?? []) {
    let key: string;
    let stat: Omit<LinkStat, "clicks" | "uniques">;
    if (s.link_slot <= 3) {
      key = `f${s.link_slot}`;
      stat = { name: featured?.find((f) => f.position === s.link_slot)?.title ?? `Featured link ${s.link_slot}`, type: "Global" };
    } else if (s.campaign_id) {
      key = `c${s.campaign_id}`;
      stat = { name: campaigns?.find((c) => c.id === s.campaign_id)?.link_title ?? "Deleted campaign", type: "Campaign" };
    } else {
      key = "default";
      stat = { name: def?.title ?? "Default fourth link", type: "Default" };
    }
    const prev = out.get(key);
    // Unique clicks are per campaign context, so summing across contexts can
    // slightly overcount the same visitor; fine for a ranking table.
    out.set(key, { ...stat, clicks: (prev?.clicks ?? 0) + s.clicks, uniques: (prev?.uniques ?? 0) + s.unique_clicks });
  }
  return [...out.values()].sort((a, b) => b.clicks - a.clicks);
}

export async function getRecentActivity(creatorId: string, limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comment_events")
    .select("id, commenter_username, comment_text, status, error, received_at, campaigns(name)")
    .eq("creator_id", creatorId)
    .order("received_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

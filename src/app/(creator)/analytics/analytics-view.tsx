"use client";

import { useState } from "react";
import { BarList, Donut, TrendChart } from "@/components/charts";
import { Tabs } from "@/components/interactive";
import { Badge, Callout, Card, CardHeader, EmptyState, StatCard, Table, Td, Th } from "@/components/ui";
import type { DailyRow, LinkStat } from "@/lib/analytics-server";
import type { CampaignStats } from "@/lib/campaigns";
import { num, pct } from "@/lib/format";

type Tab = "automation" | "storefront" | "conversions";

const rate = (part: number, whole: number) => (whole ? pct((part / whole) * 100) : "—");

export function AnalyticsView({
  rows,
  campaigns,
  keywords,
  links,
}: {
  rows: DailyRow[];
  campaigns: { id: string; name: string; active: boolean; stats: CampaignStats }[];
  keywords: { keyword: string; matches: number; sent: number }[];
  links: LinkStat[];
}) {
  const [tab, setTab] = useState<Tab>("automation");
  const t = rows.reduce(
    (a, r) => ({
      comments: a.comments + r.comments, eligible: a.eligible + r.eligible, ineligible: a.ineligible + r.ineligible,
      sent: a.sent + r.sent, failed: a.failed + r.failed, skipped: a.skipped + r.skipped,
      visits: a.visits + r.visits, uniques: a.uniques + r.uniques, clicks: a.clicks + r.clicks,
    }),
    { comments: 0, eligible: 0, ineligible: 0, sent: 0, failed: 0, skipped: 0, visits: 0, uniques: 0, clicks: 0 },
  );
  const uniqueClicks = links.reduce((a, l) => a + l.uniques, 0);
  const byType = (["Campaign", "Global", "Default"] as const)
    .map((type) => ({ name: type, value: links.filter((l) => l.type === type).reduce((a, l) => a + l.clicks, 0) }))
    .filter((d) => d.value > 0);

  return (
    <>
      <div className="mb-6">
        <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "automation", label: "Automation" }, { id: "storefront", label: "Storefront" }, { id: "conversions", label: "Conversions" }]} />
      </div>

      {tab === "automation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Comments detected" value={num(t.comments)} />
            <StatCard label="Eligible" value={num(t.eligible)} />
            <StatCard label="Ineligible" value={num(t.ineligible)} hint="No keyword match" />
            <StatCard label="DMs delivered" value={num(t.sent)} hint={t.eligible ? `${rate(t.sent, t.eligible)} of eligible` : undefined} />
            <StatCard label="Failed" value={num(t.failed)} />
            <StatCard label="Skipped" value={num(t.skipped)} hint="Duplicates" />
          </div>
          <Card>
            <CardHeader title="Comments and DMs over time" />
            <div className="p-4"><TrendChart data={rows} series={[{ key: "comments", label: "Comments" }, { key: "sent", label: "Sent", color: "#10b981" }, { key: "failed", label: "Failed", color: "#ef4444" }]} /></div>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="Keyword performance" description="Comments matched per keyword" />
              {keywords.length === 0 ? (
                <EmptyState title="No keyword matches yet" description="Matched keywords from your campaigns will appear here." />
              ) : (
                <div className="p-4">
                  <BarList horizontal xKey="keyword" data={keywords} series={[{ key: "matches", label: "Matches" }, { key: "sent", label: "DMs sent", color: "#10b981" }]} />
                </div>
              )}
            </Card>
            <Card>
              <CardHeader title="Campaign comparison" />
              {campaigns.length === 0 ? (
                <EmptyState title="No campaigns yet" />
              ) : (
                <Table>
                  <thead><tr><Th>Campaign</Th><Th className="text-right">Comments</Th><Th className="text-right">Delivered</Th><Th className="text-right">Fail rate</Th><Th className="text-right">CTR</Th></tr></thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <Td className="font-medium">{c.name}{!c.active && <span className="ml-2 text-xs font-normal text-zinc-400">Paused</span>}</Td>
                        <Td className="text-right">{num(c.stats.comments)}</Td>
                        <Td className="text-right">{num(c.stats.sent)}</Td>
                        <Td className="text-right">{rate(c.stats.failed, c.stats.eligible)}</Td>
                        <Td className="text-right">{rate(c.stats.clicks, c.stats.sent)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === "storefront" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Storefront visits" value={num(t.visits)} />
            <StatCard label="Unique visitors" value={num(t.uniques)} hint="Counted per day" />
            <StatCard label="Link clicks" value={num(t.clicks)} />
            <StatCard label="Unique link clicks" value={num(uniqueClicks)} />
            <StatCard label="Click-through rate" value={rate(t.clicks, t.visits)} hint="Clicks per visit" />
          </div>
          <Card>
            <CardHeader title="Traffic trend" />
            <div className="p-4"><TrendChart data={rows} series={[{ key: "visits", label: "Visits", color: "#5f98e2" }, { key: "uniques", label: "Unique visitors", color: "#3f79c9" }, { key: "clicks", label: "Link clicks", color: "#e47a54" }]} /></div>
          </Card>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title="Link performance" description="Most popular links on your storefront" />
              {links.length === 0 ? (
                <EmptyState title="No link clicks yet" description="Clicks on your storefront links will appear here." />
              ) : (
                <Table>
                  <thead><tr><Th>Link</Th><Th>Type</Th><Th className="text-right">Clicks</Th><Th className="text-right">Unique clicks</Th></tr></thead>
                  <tbody>
                    {links.map((l) => (
                      <tr key={`${l.type}-${l.name}`}>
                        <Td className="font-medium">{l.name}</Td>
                        <Td><Badge tone={l.type === "Campaign" ? "violet" : l.type === "Global" ? "blue" : "gray"}>{l.type}</Badge></Td>
                        <Td className="text-right">{num(l.clicks)}</Td>
                        <Td className="text-right">{num(l.uniques)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
            <Card>
              <CardHeader title="Clicks by link type" />
              {byType.length === 0 ? <EmptyState title="No clicks yet" /> : <div className="p-4"><Donut data={byType} /></div>}
            </Card>
          </div>
        </div>
      )}

      {tab === "conversions" && (
        <div className="space-y-6">
          <Callout tone="blue" title="Clicks are not purchases">
            Only purchases confirmed by a connected checkout or payment provider count as verified. Purchase tracking is coming soon.
          </Callout>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Verified purchases" value="—" />
            <StatCard label="Unverified / manual" value="—" />
            <StatCard label="Attributed revenue" value="—" hint="Linked to a campaign" />
            <StatCard label="Unattributed revenue" value="—" />
          </div>
          <Card>
            <CardHeader title="Purchase integrations" description="Sources of verified purchase events." />
            <ul className="divide-y divide-zinc-100">
              {["Razorpay Payment Links", "Checkout webhook (custom)", "Manual entry"].map((name) => (
                <li key={name} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="font-medium">{name}</span>
                  <Badge>Coming soon</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}

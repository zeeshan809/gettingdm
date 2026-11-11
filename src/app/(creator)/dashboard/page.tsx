import Link from "next/link";
import { Plus } from "lucide-react";
import { TrendChart } from "@/components/charts";
import { RangeFilter } from "@/components/range-filter";
import { AutomationBadge, Card, CardHeader, Callout, EmptyState, LinkButton, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { getCampaignTable, getDaily, getRecentActivity, sumRows } from "@/lib/analytics-server";
import { getCurrentCreator } from "@/lib/auth";
import { resolveRange } from "@/lib/date-range";
import { dateTime, num, pct } from "@/lib/format";

export const metadata = { title: "Dashboard" };

type Props = { searchParams: Promise<{ range?: string; from?: string; to?: string }> };

const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);

export default async function DashboardPage({ searchParams }: Props) {
  const range = resolveRange(await searchParams);
  const creator = await getCurrentCreator();
  const [{ rows, prevTotals: p }, campaigns, activity] = await Promise.all([
    getDaily(range),
    getCampaignTable(creator.id, range),
    getRecentActivity(creator.id),
  ]);
  const t = sumRows(rows);
  const firstName = (creator.full_name || creator.username).split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName} 👋`}
        description="Here's how your automations and storefront are performing."
        actions={<LinkButton href="/campaigns/new"><Plus className="h-4 w-4" /> New campaign</LinkButton>}
      />

      {creator.trialDaysLeft != null && creator.trialDaysLeft <= 7 && (
        <div className="mb-6">
          <Callout
            tone="yellow"
            title={creator.trialDaysLeft === 0 ? "Your free trial ends today" : `Your free trial ends in ${creator.trialDaysLeft} day${creator.trialDaysLeft === 1 ? "" : "s"}`}
            action={<LinkButton href="/billing" size="sm">Choose a plan</LinkButton>}
          >
            Campaigns pause automatically when the trial ends unless you subscribe.
          </Callout>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <RangeFilter range={range} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total campaigns" value={campaigns.length} />
        <StatCard label="Active campaigns" value={campaigns.filter((c) => c.active).length} />
        <StatCard label="Comments detected" value={num(t.comments)} delta={delta(t.comments, p.comments)} />
        <StatCard label="Eligible comments" value={num(t.eligible)} />
        <StatCard label="DMs sent" value={num(t.sent)} delta={delta(t.sent, p.sent)} />
        <StatCard label="Failed DMs" value={num(t.failed)} hint={t.eligible ? `${pct((t.failed / t.eligible) * 100)} of eligible` : undefined} />
        <StatCard label="Link deliveries" value={num(t.sent)} hint="DMs with your link" />
        <StatCard label="Link clicks" value={num(t.clicks)} delta={delta(t.clicks, p.clicks)} />
        <StatCard label="Unique visitors" value={num(t.uniques)} hint="Counted per day" />
        <StatCard label="Storefront visits" value={num(t.visits)} delta={delta(t.visits, p.visits)} />
        <StatCard label="Purchases" value="—" hint="Connect a checkout to track" />
        <StatCard label="Attributed revenue" value="—" hint="Connect a checkout to track" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Automation" description="Comments detected vs DMs delivered" />
          <div className="p-4">
            <TrendChart data={rows} series={[{ key: "comments", label: "Comments" }, { key: "sent", label: "DMs sent", color: "#10b981" }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Storefront" description="Visits and link clicks" />
          <div className="p-4">
            <TrendChart data={rows} series={[{ key: "visits", label: "Visits", color: "#0ea5e9" }, { key: "clicks", label: "Clicks", color: "#db2777" }]} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Campaigns" description="In the selected period" action={<Link href="/campaigns" className="text-xs font-medium text-violet-700">View all</Link>} />
          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Create one to start replying to comments automatically." action={<LinkButton href="/campaigns/new" size="sm">Create campaign</LinkButton>} />
          ) : (
            <Table>
              <thead>
                <tr><Th>Campaign</Th><Th>Keywords</Th><Th className="text-right">DMs sent</Th><Th className="text-right">Clicks</Th><Th className="text-right">CTR</Th></tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <Td>
                      <Link href={`/campaigns/${c.id}`} className="font-medium text-zinc-900 hover:text-violet-700">{c.name}</Link>
                      {!c.active && <span className="ml-2 text-xs text-zinc-400">Paused</span>}
                    </Td>
                    <Td className="font-mono text-xs">{c.keywords.join(", ")}</Td>
                    <Td className="text-right">{num(c.stats.sent)}</Td>
                    <Td className="text-right">{num(c.stats.clicks)}</Td>
                    <Td className="text-right">{c.stats.sent ? pct((c.stats.clicks / c.stats.sent) * 100) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Live activity" description="Latest comments processed" />
          {activity.length === 0 ? (
            <EmptyState title="No comments yet" description="Comments on your campaign posts will show up here as they arrive." />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      <span className="font-medium">{a.commenter_username ? `@${a.commenter_username}` : "Someone"}</span>{" "}
                      <span className="text-zinc-500">{a.comment_text ? `“${a.comment_text}”` : ""}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                      {dateTime(a.received_at)}{a.campaigns?.name && ` · ${a.campaigns.name}`}{a.error && ` · ${a.error}`}
                    </p>
                  </div>
                  <AutomationBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

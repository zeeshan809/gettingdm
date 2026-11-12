import Link from "next/link";
import { ArrowRight, Check, Instagram, Megaphone, MousePointerClick, Percent, Plus, Send, Store } from "lucide-react";
import type { ReactNode } from "react";
import { TrendChart } from "@/components/charts";
import { RangeFilter } from "@/components/range-filter";
import { AutomationBadge, Card, CardHeader, Callout, EmptyState, LinkButton, cn } from "@/components/ui";
import { getCampaignTable, getDaily, getRecentActivity, sumRows } from "@/lib/analytics-server";
import { getCurrentCreator } from "@/lib/auth";
import { resolveRange } from "@/lib/date-range";
import { dateTime, num, pct } from "@/lib/format";
import { getInstagramAccount } from "@/lib/instagram";

export const metadata = { title: "Dashboard" };

type Props = { searchParams: Promise<{ range?: string; from?: string; to?: string }> };

const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : undefined);
const rate = (part: number, whole: number) => (whole ? pct((part / whole) * 100) : "—");

export default async function DashboardPage({ searchParams }: Props) {
  const range = resolveRange(await searchParams);
  const creator = await getCurrentCreator();
  const [{ rows, prevTotals: p }, campaigns, activity, instagram] = await Promise.all([
    getDaily(range),
    getCampaignTable(creator.id, range),
    getRecentActivity(creator.id),
    getInstagramAccount(creator.id),
  ]);
  const t = sumRows(rows);
  const firstName = (creator.full_name || creator.username).split(" ")[0];
  const activeCount = campaigns.filter((c) => c.active).length;
  const hasData = t.comments + t.visits + t.clicks > 0;

  const setup = [
    { done: instagram?.status === "connected", title: "Connect Instagram", body: "Log in with Meta so we can reply to comments.", href: "/instagram", cta: "Connect", icon: Instagram },
    { done: !!creator.onboarding_completed, title: "Set up your storefront", body: "Add your photo and the links followers should see.", href: "/storefront", cta: "Set up", icon: Store },
    { done: campaigns.length > 0, title: "Create your first campaign", body: "Pick a Reel, a keyword and the link to send.", href: "/campaigns/new", cta: "Create", icon: Megaphone },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Hi, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {activeCount ? `${activeCount} campaign${activeCount === 1 ? "" : "s"} replying to comments right now.` : "No campaigns running yet."}
          </p>
        </div>
        <LinkButton href="/campaigns/new" size="lg" className="w-full sm:w-auto"><Plus className="h-4 w-4" /> New campaign</LinkButton>
      </div>

      {creator.trialDaysLeft != null && creator.trialDaysLeft <= 7 && (
        <Callout
          tone="yellow"
          title={creator.trialDaysLeft === 0 ? "Your free trial ends today" : `Your free trial ends in ${creator.trialDaysLeft} day${creator.trialDaysLeft === 1 ? "" : "s"}`}
          action={<LinkButton href="/billing" size="sm">Choose a plan</LinkButton>}
        >
          Campaigns pause automatically when the trial ends unless you subscribe.
        </Callout>
      )}

      {/* Getting started: hidden once everything is done */}
      {setupDone < setup.length && (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900">Get set up</h2>
              <p className="text-sm text-zinc-500">{setupDone} of {setup.length} done. Finish these to start getting DMs out.</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 sm:w-40">
              <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${(setupDone / setup.length) * 100}%` }} />
            </div>
          </div>
          <ol className="divide-y divide-zinc-100">
            {setup.map((s, i) => (
              <li key={s.title} className="flex items-center gap-4 px-5 py-4">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  s.done ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700")}>
                  {s.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", s.done ? "text-zinc-400 line-through" : "text-zinc-900")}>{s.title}</p>
                  {!s.done && <p className="text-xs text-zinc-500">{s.body}</p>}
                </div>
                {!s.done && (
                  <Link href={s.href} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">
                    {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Performance */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-zinc-900">Performance</h2>
          <RangeFilter range={range} />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={<Send className="h-4 w-4" />} label="DMs sent" value={num(t.sent)} change={delta(t.sent, p.sent)} />
          <Kpi icon={<MousePointerClick className="h-4 w-4" />} label="Link clicks" value={num(t.clicks)} change={delta(t.clicks, p.clicks)} />
          <Kpi icon={<Store className="h-4 w-4" />} label="Storefront visits" value={num(t.visits)} change={delta(t.visits, p.visits)} />
          <Kpi icon={<Percent className="h-4 w-4" />} label="Click rate" value={rate(t.clicks, t.sent)} note="Clicks per DM sent" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Daily activity" description="DMs sent and link clicks" />
            {hasData ? (
              <div className="p-3 sm:p-4">
                <TrendChart data={rows} height={240} series={[{ key: "sent", label: "DMs sent", color: "#3f79c9" }, { key: "clicks", label: "Link clicks", color: "#e47a54" }]} />
              </div>
            ) : (
              <EmptyState title="Nothing to show yet" description="Your chart fills in as soon as someone comments on a campaign post." />
            )}
          </Card>

          <Card>
            <CardHeader title="Funnel" description="From comment to click" />
            <div className="space-y-4 p-5">
              <FunnelStep label="Comments" value={t.comments} max={t.comments} />
              <FunnelStep label="Matched a keyword" value={t.eligible} max={t.comments} rateLabel={rate(t.eligible, t.comments)} />
              <FunnelStep label="DMs sent" value={t.sent} max={t.comments} rateLabel={rate(t.sent, t.eligible)} />
              <FunnelStep label="Link clicks" value={t.clicks} max={t.comments} rateLabel={rate(t.clicks, t.sent)} accent />
              <dl className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-xs">
                <div><dt className="text-zinc-500">Failed DMs</dt><dd className="mt-0.5 text-sm font-semibold text-zinc-900">{num(t.failed)}</dd></div>
                <div><dt className="text-zinc-500">Unique visitors</dt><dd className="mt-0.5 text-sm font-semibold text-zinc-900">{num(t.uniques)}</dd></div>
              </dl>
            </div>
          </Card>
        </div>
      </section>

      {/* Campaigns + activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Campaigns"
            description={`${activeCount} active · ${campaigns.length} total`}
            action={campaigns.length > 0 ? <Link href="/campaigns" className="text-xs font-medium text-violet-700">View all</Link> : undefined}
          />
          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Create one to start replying to comments automatically." action={<LinkButton href="/campaigns/new" size="sm">Create campaign</LinkButton>} />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link href={`/campaigns/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", c.active ? "bg-emerald-500" : "bg-zinc-300")} aria-label={c.active ? "Active" : "Paused"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{c.name}</p>
                      <p className="truncate font-mono text-xs text-zinc-500">{c.keywords.join(", ")}</p>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 gap-4 text-right sm:grid-cols-3">
                      <Metric label="DMs" value={num(c.stats.sent)} />
                      <Metric label="Clicks" value={num(c.stats.clicks)} />
                      <Metric label="CTR" value={rate(c.stats.clicks, c.stats.sent)} className="hidden sm:block" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
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
    </div>
  );
}

function Kpi({ icon, label, value, change, note }: { icon: ReactNode; label: string; value: string; change?: number; note?: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-700">{icon}</span>
        <p className="truncate text-xs font-medium sm:text-sm">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{value}</p>
      <p className="mt-1 h-4 truncate text-xs text-zinc-500">
        {change !== undefined ? (
          <span className={cn("font-medium", change >= 0 ? "text-emerald-600" : "text-red-600")}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% <span className="font-normal text-zinc-400">vs previous</span>
          </span>
        ) : note}
      </p>
    </Card>
  );
}

function FunnelStep({ label, value, max, rateLabel, accent }: { label: string; value: number; max: number; rateLabel?: string; accent?: boolean }) {
  const width = max ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-zinc-600">{label}</span>
        <span className="font-semibold text-zinc-900">
          {num(value)}
          {rateLabel && <span className="ml-1.5 text-xs font-normal text-zinc-400">{rateLabel}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-zinc-100">
        <div className={cn("h-full rounded-full", accent ? "bg-pink-400" : "bg-violet-400")} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}

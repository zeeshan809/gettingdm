"use client";

import { useMemo, useState } from "react";
import { BarList, LineTrend, TrendChart } from "@/components/charts-lazy";
import { DateRangeFilter, rangeDays, type RangeId } from "@/components/interactive";
import { Card, CardHeader, PageHeader, StatCard } from "@/components/ui";
import { adminDaily, adminKpis } from "@/lib/mock-data";
import { inr, num, pct } from "@/lib/format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState<RangeId>("30d");
  const rows = useMemo(() => adminDaily.slice(-rangeDays(range)), [range]);
  const { users, instagram, storefront, finance } = adminKpis;

  return (
    <>
      <PageHeader title="Platform overview" description="All creators, automations, storefronts and revenue." actions={<DateRangeFilter value={range} onChange={setRange} />} />

      <div className="space-y-8">
        <Section title="Financial">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <StatCard label="MRR" value={inr(finance.mrr)} delta={6.2} />
            <StatCard label="ARR" value={inr(finance.arr)} />
            <StatCard label="Total revenue" value={inr(finance.totalRevenue)} />
            <StatCard label="ARPU" value={inr(finance.arpu)} />
            <StatCard label="Churn rate" value={pct(finance.churn)} />
            <StatCard label="Failed payments" value={num(finance.failedPayments)} />
            <StatCard label="Refunds" value={num(finance.refunds)} />
            <StatCard label="Trial → paid" value={pct(users.trialToPaid)} />
          </div>
        </Section>

        <Section title="Creators">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Registered" value={num(users.total)} />
            <StatCard label="Active" value={num(users.active)} />
            <StatCard label="On trial" value={num(users.trial)} />
            <StatCard label="Paying" value={num(users.paying)} />
            <StatCard label="Cancelled" value={num(users.cancelled)} />
            <StatCard label="Suspended" value={num(users.suspended)} />
          </div>
        </Section>

        <Section title="Instagram & automation">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Connected accounts" value={num(instagram.connected)} />
            <StatCard label="Disconnected" value={num(instagram.disconnected)} />
            <StatCard label="Active campaigns" value={num(instagram.activeCampaigns)} />
            <StatCard label="Comments processed" value={num(instagram.comments)} />
            <StatCard label="DMs sent" value={num(instagram.dms)} />
            <StatCard label="Failed DMs" value={num(instagram.failed)} hint={pct((instagram.failed / instagram.comments) * 100) + " failure rate"} />
          </div>
        </Section>

        <Section title="Storefronts">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Storefronts" value={num(storefront.total)} />
            <StatCard label="Visits" value={num(storefront.visits)} />
            <StatCard label="Unique visitors" value={num(storefront.uniques)} />
            <StatCard label="Link clicks" value={num(storefront.clicks)} />
            <StatCard label="Verified purchases" value={num(storefront.verifiedPurchases)} />
            <StatCard label="Attributed revenue" value={inr(storefront.attributedRevenue)} />
          </div>
        </Section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader title="MRR" />
            <div className="p-4"><LineTrend data={rows} series={[{ key: "mrr", label: "MRR" }]} valueFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} /></div>
          </Card>
          <Card>
            <CardHeader title="Revenue by plan" description={finance.byPlan.map((p) => `${p.plan}: ${num(p.subscribers)} subscribers`).join(" · ")} />
            <div className="p-4"><BarList data={finance.byPlan} xKey="plan" series={[{ key: "mrr", label: "MRR (₹)" }]} /></div>
          </Card>
          <Card>
            <CardHeader title="Automation volume" />
            <div className="p-4"><TrendChart data={rows} series={[{ key: "comments", label: "Comments" }, { key: "dms", label: "DMs sent", color: "#10b981" }]} /></div>
          </Card>
          <Card>
            <CardHeader title="New sign-ups" />
            <div className="p-4"><BarList data={rows} xKey="date" series={[{ key: "signups", label: "Sign-ups" }]} /></div>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { BarList, Donut, LineTrend, TrendChart } from "@/components/charts";
import { DateRangeFilter, rangeDays, type RangeId } from "@/components/interactive";
import { Card, CardHeader, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { adminDaily, allCreators } from "@/lib/mock-data";
import { num } from "@/lib/format";

// Monthly cohort retention (% of creators still active N months after sign-up).
const cohorts = [
  { month: "Jul 2026", size: 142, m1: 81, m2: 70, m3: 64, m4: 61 },
  { month: "Aug 2026", size: 238, m1: 79, m2: 68, m3: 62 },
  { month: "Sep 2026", size: 311, m1: 83, m2: 72 },
  { month: "Oct 2026", size: 402, m1: 85 },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<RangeId>("30d");
  const rows = useMemo(() => adminDaily.slice(-rangeDays(range)), [range]);
  const last = rows[rows.length - 1];
  const statusMix = Object.entries(
    allCreators.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.subscription]: (acc[c.subscription] ?? 0) + 1 }), {}),
  ).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  return (
    <>
      <PageHeader title="Platform analytics" description="Growth, engagement and retention across all creators." actions={<DateRangeFilter value={range} onChange={setRange} />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Daily active creators" value={num(last.activeCreators)} />
        <StatCard label="Monthly active creators" value={num(912)} />
        <StatCard label="New registrations" value={num(rows.reduce((a, r) => a + r.signups, 0))} />
        <StatCard label="Storefront visits" value={num(rows.reduce((a, r) => a + r.visits, 0))} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Daily active creators" />
          <div className="p-4"><LineTrend data={rows} series={[{ key: "activeCreators", label: "Active creators" }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Storefront traffic" />
          <div className="p-4"><TrendChart data={rows} series={[{ key: "visits", label: "Visits", color: "#0ea5e9" }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Subscription status mix" />
          <div className="p-4"><Donut data={statusMix} height={260} /></div>
        </Card>
        <Card>
          <CardHeader title="Failed DMs per day" />
          <div className="p-4"><BarList data={rows} xKey="date" series={[{ key: "failedDms", label: "Failed DMs", color: "#ef4444" }]} /></div>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Creator retention by sign-up cohort" description="% of cohort still active after N months" />
        <Table>
          <thead><tr><Th>Cohort</Th><Th className="text-right">Creators</Th><Th className="text-center">Month 1</Th><Th className="text-center">Month 2</Th><Th className="text-center">Month 3</Th><Th className="text-center">Month 4</Th></tr></thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.month}>
                <Td className="font-medium">{c.month}</Td>
                <Td className="text-right">{c.size}</Td>
                {[c.m1, c.m2, c.m3, c.m4].map((v, i) => (
                  <Td key={i} className="text-center">
                    {v === undefined ? <span className="text-zinc-300">—</span> : (
                      <span className="inline-block w-12 rounded py-0.5 text-xs font-medium" style={{ background: `rgba(124, 58, 237, ${v / 120})`, color: v > 70 ? "white" : "#3f3f46" }}>{v}%</span>
                    )}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

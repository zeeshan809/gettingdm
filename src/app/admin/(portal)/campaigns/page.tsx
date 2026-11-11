"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AuditedAction } from "@/components/interactive";
import { Badge, Card, CardHeader, Input, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { adminCampaigns } from "@/lib/mock-data";
import { num, pct } from "@/lib/format";

export default function AdminCampaignsPage() {
  const [q, setQ] = useState("");
  const [problemsOnly, setProblemsOnly] = useState(false);
  const failRate = (c: (typeof adminCampaigns)[number]) => (c.comments ? (c.failed / c.comments) * 100 : 0);
  const rows = adminCampaigns
    .filter((c) => !q || c.creator.includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase()))
    .filter((c) => !problemsOnly || failRate(c) > 5);

  const queued = adminCampaigns.reduce((a, c) => a + c.queued, 0);
  const dupes = adminCampaigns.reduce((a, c) => a + c.duplicatesBlocked, 0);

  return (
    <>
      <PageHeader title="Campaign monitoring" description="All creator campaigns, delivery health and queued jobs." />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Campaigns" value={num(adminCampaigns.length)} />
        <StatCard label="Active" value={num(adminCampaigns.filter((c) => c.status === "active").length)} />
        <StatCard label="Jobs queued" value={num(queued)} />
        <StatCard label="Duplicate replies blocked" value={num(dupes)} hint="Idempotency checks" />
      </div>
      <Card>
        <CardHeader
          title="Campaigns"
          action={
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
              <input type="checkbox" checked={problemsOnly} onChange={(e) => setProblemsOnly(e.target.checked)} className="accent-violet-600" />
              Failure rate &gt; 5% only
            </label>
          }
        />
        <div className="border-b border-zinc-100 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by creator or campaign" className="pl-9" />
          </div>
        </div>
        <Table>
          <thead><tr><Th>Campaign</Th><Th>Creator</Th><Th>Keyword</Th><Th>Status</Th><Th className="text-right">Comments</Th><Th className="text-right">Sent</Th><Th className="text-right">Fail rate</Th><Th className="text-right">Queued</Th><Th /></tr></thead>
          <tbody>
            {rows.map((c) => {
              const fr = failRate(c);
              return (
                <tr key={c.id}>
                  <Td className="font-medium">{c.name}</Td>
                  <Td>@{c.creator}</Td>
                  <Td className="font-mono text-xs">{c.keyword}</Td>
                  <Td>{c.status === "active" ? <Badge tone="green">Active</Badge> : c.status === "paused_admin" ? <Badge tone="red">Paused by admin</Badge> : <Badge>Inactive</Badge>}</Td>
                  <Td className="text-right">{num(c.comments)}</Td>
                  <Td className="text-right">{num(c.sent)}</Td>
                  <Td className={fr > 5 ? "text-right font-medium text-red-600" : "text-right"}>{pct(fr)}</Td>
                  <Td className="text-right">{c.queued}</Td>
                  <Td className="text-right">
                    {c.status === "active" && <AuditedAction label="Pause" danger title={`Pause ${c.name}?`} description="The campaign stops replying to new comments. The creator is notified." confirmLabel="Pause campaign" />}
                    {c.status === "paused_admin" && <AuditedAction label="Resume" title={`Resume ${c.name}?`} description="The campaign resumes replying to new comments." confirmLabel="Resume campaign" />}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge, Card, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui";
import { auditLogs } from "@/lib/mock-data";
import { dateTime } from "@/lib/format";

export default function AuditLogsPage() {
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("all");
  const actors = [...new Set(auditLogs.map((l) => l.actor))];
  const rows = auditLogs.filter(
    (l) => (actor === "all" || l.actor === actor) && (!q || `${l.action} ${l.target} ${l.detail}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader title="Audit logs" description="Every sensitive admin action, who did it, and why. Read-only." />
      <Card>
        <div className="flex flex-col gap-2 border-b border-zinc-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, target or detail" className="pl-9" />
          </div>
          <Select value={actor} onChange={(e) => setActor(e.target.value)} className="sm:w-52">
            <option value="all">All admins</option>
            {actors.map((a) => <option key={a}>{a}</option>)}
          </Select>
        </div>
        <Table>
          <thead><tr><Th>Time</Th><Th>Admin</Th><Th>Action</Th><Th>Target</Th><Th>Detail</Th><Th>IP</Th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <Td>{dateTime(l.at)}</Td>
                <Td><span className="font-medium">{l.actor}</span><span className="block text-xs text-zinc-500">{l.role}</span></Td>
                <Td><Badge tone="violet" className="font-mono">{l.action}</Badge></Td>
                <Td className="font-mono text-xs">{l.target}</Td>
                <Td>{l.detail}</Td>
                <Td className="font-mono text-xs text-zinc-500">{l.ip}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import { useToast } from "@/components/interactive";
import { Badge, Button, Card, CardHeader, cn, PageHeader, Select, StatCard, Textarea, TicketBadge } from "@/components/ui";
import { adminTickets, type TicketStatus } from "@/lib/mock-data";
import { date } from "@/lib/format";

const assignees = ["Ananya (Support)", "Priyanka (Ops)", "Rakesh (Finance)"];

export default function AdminSupportPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState(adminTickets);
  const [selectedId, setSelectedId] = useState(adminTickets[0].id);
  const selected = tickets.find((t) => t.id === selectedId)!;
  const update = (patch: Partial<(typeof tickets)[number]>) => setTickets((ts) => ts.map((t) => (t.id === selectedId ? { ...t, ...patch } : t)));

  return (
    <>
      <PageHeader title="Support tickets" />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open" value={tickets.filter((t) => t.status === "open").length} />
        <StatCard label="In progress" value={tickets.filter((t) => t.status === "in_progress").length} />
        <StatCard label="Unassigned" value={tickets.filter((t) => !t.assignee).length} />
        <StatCard label="Avg resolution" value="7.4h" hint="Last 30 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <ul className="divide-y divide-zinc-100">
            {tickets.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setSelectedId(t.id)} className={cn("w-full px-4 py-3 text-left hover:bg-zinc-50", t.id === selectedId && "bg-violet-50/60")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-500">{t.id}</span>
                    <TicketBadge status={t.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-zinc-500">@{t.creator} · {date(t.createdAt)} {t.priority === "priority" && "· ⚡ Priority"}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title={selected.subject} description={`${selected.id} · @${selected.creator} · opened ${date(selected.createdAt)}`} action={selected.priority === "priority" ? <Badge tone="violet">Priority</Badge> : undefined} />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-medium">Status</p>
              <Select value={selected.status} onChange={(e) => update({ status: e.target.value as TicketStatus })}>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting">Waiting for creator</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Assignee</p>
              <Select value={selected.assignee ?? ""} onChange={(e) => update({ assignee: e.target.value || null })}>
                <option value="">Unassigned</option>
                {assignees.map((a) => <option key={a}>{a}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-3 border-t border-zinc-100 p-5">
            <div className="rounded-lg bg-zinc-50 p-3 text-sm">
              <p className="text-xs font-medium text-zinc-500">@{selected.creator} wrote</p>
              <p className="mt-1">Hi, {selected.subject.toLowerCase()}. Can you help?</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="text-xs font-medium text-amber-700">Internal note · Ananya</p>
              <p className="mt-1">Checked webhook logs — events arriving fine. Looking at token status.</p>
            </div>
            <Textarea rows={3} placeholder="Reply to creator or add an internal note…" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast("Internal note added")}>Add internal note</Button>
              <Button size="sm" onClick={() => toast("Reply sent")}>Send reply</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

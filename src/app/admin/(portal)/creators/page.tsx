"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, Card, ConnectionBadge, Input, PageHeader, Select, SubscriptionBadge, Table, Td, Th } from "@/components/ui";
import { allCreators, type SubscriptionStatus } from "@/lib/mock-data";
import { date, num } from "@/lib/format";

export default function AdminCreatorsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const query = q.trim().toLowerCase();
  const rows = allCreators.filter(
    (c) =>
      (status === "all" || c.subscription === status) &&
      (!query || c.name.toLowerCase().includes(query) || c.email.includes(query) || c.username.includes(query)),
  );

  return (
    <>
      <PageHeader title="Creators" description={`${num(allCreators.length)} creators shown from mock data`} />
      <Card>
        <div className="flex flex-col gap-2 border-b border-zinc-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or username" className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus | "all")} className="sm:w-48">
            <option value="all">All subscriptions</option>
            {["trial", "active", "payment_pending", "past_due", "cancelled", "expired", "suspended"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </Select>
        </div>
        <Table>
          <thead><tr><Th>Creator</Th><Th>Plan</Th><Th>Subscription</Th><Th>Instagram</Th><Th className="text-right">Campaigns</Th><Th className="text-right">DMs sent</Th><Th>Joined</Th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <Td>
                  <Link href={`/admin/creators/${c.id}`} className="flex items-center gap-2.5">
                    <Avatar name={c.name} hue={c.avatarHue} size={30} />
                    <span>
                      <span className="block font-medium text-zinc-900">{c.name}</span>
                      <span className="block text-xs text-zinc-500">@{c.username} · {c.email}</span>
                    </span>
                  </Link>
                </Td>
                <Td>{c.plan === "creator_plus" ? "Creator Plus" : "Creator"}</Td>
                <Td><SubscriptionBadge status={c.subscription} /></Td>
                <Td><ConnectionBadge status={c.instagram?.status ?? "disconnected"} /></Td>
                <Td className="text-right">{c.campaignsCount}</Td>
                <Td className="text-right">{num(c.dmsSent)}</Td>
                <Td>{date(c.joinedAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No creators match.</p>}
      </Card>
    </>
  );
}

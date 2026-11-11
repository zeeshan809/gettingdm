"use client";

import { useState } from "react";
import { AuditedAction, Tabs } from "@/components/interactive";
import { Badge, Card, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { adminPayments } from "@/lib/mock-data";
import { date, inr, num } from "@/lib/format";

type Filter = "all" | "success" | "failed" | "pending" | "refunded";
const tone = { success: "green", failed: "red", pending: "yellow", refunded: "gray" } as const;

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = adminPayments.filter((p) => filter === "all" || p.status === filter);
  const sum = (s: Filter) => adminPayments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
  const unreconciled = adminPayments.filter((p) => !p.reconciled).length;

  return (
    <>
      <PageHeader title="Payments" description="Razorpay payments, renewals, refunds and reconciliation." />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Collected" value={inr(sum("success"))} />
        <StatCard label="Failed" value={inr(sum("failed"))} />
        <StatCard label="Pending" value={inr(sum("pending"))} />
        <StatCard label="Refunded" value={inr(sum("refunded"))} />
        <StatCard label="Unreconciled" value={num(unreconciled)} hint="Webhook vs gateway mismatch" />
      </div>
      <Card>
        <div className="px-4 pt-2">
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[{ id: "all", label: "All" }, { id: "success", label: "Successful" }, { id: "failed", label: "Failed" }, { id: "pending", label: "Pending" }, { id: "refunded", label: "Refunds" }]}
          />
        </div>
        <Table>
          <thead><tr><Th>Date</Th><Th>Payment</Th><Th>Creator</Th><Th>Type</Th><Th>Plan</Th><Th className="text-right">Amount</Th><Th>Status</Th><Th>Reconciled</Th><Th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <Td>{date(p.date)}</Td>
                <Td className="font-mono text-xs">{p.razorpayId}</Td>
                <Td>@{p.creator}</Td>
                <Td>{p.kind}</Td>
                <Td>{p.plan}</Td>
                <Td className="text-right">{inr(p.amount)}</Td>
                <Td><Badge tone={tone[p.status]}>{p.status}</Badge></Td>
                <Td>{p.reconciled ? <span className="text-emerald-600">✓</span> : <Badge tone="yellow">Mismatch</Badge>}</Td>
                <Td className="text-right">
                  {p.status === "success" && <AuditedAction label="Refund" danger title={`Refund ${inr(p.amount)} to @${p.creator}?`} description="Issues a refund through Razorpay. This cannot be undone." confirmLabel="Issue refund" />}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

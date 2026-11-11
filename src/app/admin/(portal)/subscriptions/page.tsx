"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/interactive";
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, StatCard, SubscriptionBadge, Table, Td, Th } from "@/components/ui";
import { PLANS, TRIAL_DAYS } from "@/lib/config";
import { allCreators, type SubscriptionStatus } from "@/lib/mock-data";
import { date } from "@/lib/format";

const limitDefaults = {
  creator: { campaigns: 5, keywords: 5, dmsPerDay: 500 },
  creator_plus: { campaigns: 50, keywords: 20, dmsPerDay: 5000 },
};

export default function AdminSubscriptionsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all");
  const rows = allCreators.filter((c) => filter === "all" || c.subscription === filter);
  const count = (s: SubscriptionStatus) => allCreators.filter((c) => c.subscription === s).length;

  return (
    <>
      <PageHeader title="Subscriptions & plans" description="Subscription records, trial settings, pricing and plan limits." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {(["trial", "active", "payment_pending", "past_due", "cancelled", "expired", "suspended"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(filter === s ? "all" : s)} className="text-left">
            <StatCard label={s.replace("_", " ")} value={count(s)} hint={filter === s ? "Filtering ✓" : undefined} />
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Subscriptions" description={filter === "all" ? "All statuses" : `Status: ${filter.replace("_", " ")}`} />
          <Table>
            <thead><tr><Th>Creator</Th><Th>Plan</Th><Th>Status</Th><Th>Trial ends</Th><Th /></tr></thead>
            <tbody>
              {rows.slice(0, 20).map((c) => (
                <tr key={c.id}>
                  <Td><Link href={`/admin/creators/${c.id}`} className="font-medium hover:text-violet-700">@{c.username}</Link></Td>
                  <Td>{c.plan === "creator_plus" ? "Creator Plus" : "Creator"}</Td>
                  <Td><SubscriptionBadge status={c.subscription} /></Td>
                  <Td>{date(c.trialEnd)}</Td>
                  <Td className="text-right">
                    <Select className="h-8 w-36 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) toast(`Status → ${e.target.value} (audit logged)`); e.target.value = ""; }}>
                      <option value="">Change status…</option>
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Trial" />
            <form className="space-y-3 p-5" onSubmit={(e) => { e.preventDefault(); toast("Trial settings saved"); }}>
              <Field label="Trial duration (days)" help="Applies to new sign-ups only."><Input type="number" min={0} max={90} defaultValue={TRIAL_DAYS} /></Field>
              <Field label="Expiry reminder (days before)"><Input type="text" defaultValue="7, 3, 1" /></Field>
              <Button type="submit" size="sm">Save</Button>
            </form>
          </Card>

          {PLANS.map((p) => (
            <Card key={p.id}>
              <CardHeader title={`${p.name} plan`} />
              <form className="grid grid-cols-2 gap-3 p-5" onSubmit={(e) => { e.preventDefault(); toast(`${p.name} plan updated`); }}>
                <Field label="Price (₹/month)"><Input type="number" defaultValue={p.price} /></Field>
                <Field label="Active campaigns"><Input type="number" defaultValue={limitDefaults[p.id].campaigns} /></Field>
                <Field label="Keywords / campaign"><Input type="number" defaultValue={limitDefaults[p.id].keywords} /></Field>
                <Field label="DMs / day"><Input type="number" defaultValue={limitDefaults[p.id].dmsPerDay} /></Field>
                <Field label="Advanced analytics">
                  <Select defaultValue={p.id === "creator" ? "limited" : "full"}><option value="limited">Limited</option><option value="full">Full</option></Select>
                </Field>
                <Field label="Support">
                  <Select defaultValue={p.id === "creator" ? "standard" : "priority"}><option value="standard">Standard</option><option value="priority">Priority</option></Select>
                </Field>
                <div className="col-span-2"><Button type="submit" size="sm">Save plan</Button></div>
              </form>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

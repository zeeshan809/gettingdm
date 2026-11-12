"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Badge, Button, Callout, Card, CardHeader, cn, PageHeader, Progress, SubscriptionBadge, Table, Td, Th } from "@/components/ui";
import { PLANS, TRIAL_DAYS, type PlanId } from "@/lib/config";
import { campaigns, currentCreator, payments, TODAY } from "@/lib/mock-data";
import { date, daysBetween, inr } from "@/lib/format";

export default function BillingPage() {
  const toast = useToast();
  const [checkout, setCheckout] = useState<PlanId | null>(null);
  const daysLeft = daysBetween(TODAY, currentCreator.trialEnd);
  const used = TRIAL_DAYS - daysLeft;
  const plan = PLANS.find((p) => p.id === checkout);
  const activeCampaigns = campaigns.filter((c) => c.active).length;

  return (
    <>
      <PageHeader title="Subscription" description="Manage your plan, payments and invoices." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Current plan" action={<SubscriptionBadge status={currentCreator.subscription} />} />
          <div className="space-y-4 p-5">
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Free trial — {daysLeft} days left</p>
                <p className="text-xs text-zinc-500">{date(currentCreator.trialStart)} – {date(currentCreator.trialEnd)}</p>
              </div>
              <div className="mt-2"><Progress value={(used / TRIAL_DAYS) * 100} tone={daysLeft <= 7 ? "yellow" : "violet"} /></div>
            </div>
            <Callout tone="violet" title="What happens when the trial ends?">
              Campaigns pause and your storefront stays live with your three featured links. Subscribe any time to resume automations.
            </Callout>
          </div>
        </Card>
        <Card>
          <CardHeader title="Usage this month" />
          <div className="space-y-4 p-5 text-sm">
            <div>
              <div className="mb-1.5 flex justify-between"><span>Active campaigns</span><span className="font-medium">{activeCampaigns} / 5</span></div>
              <Progress value={(activeCampaigns / 5) * 100} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between"><span>DMs sent</span><span className="font-medium">2,184 / unlimited</span></div>
              <Progress value={20} tone="green" />
            </div>
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">Choose a plan</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => {
          const featured = p.id === "creator_plus";
          return (
            <Card key={p.id} className={cn("p-5", featured && "border-2 border-violet-600")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.name}</p>
                {featured && <Badge tone="violet">Recommended</Badge>}
              </div>
              <p className="mt-2"><span className="text-3xl font-semibold">₹{p.price}</span><span className="text-sm text-zinc-500">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.filter((f) => !f.soon).map((f) => (
                  <li key={f.label} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-violet-600" /><span>{f.label}{f.value !== "Included" && <span className="text-zinc-500"> · {f.value}</span>}</span></li>
                ))}
                <li className="flex gap-2 text-zinc-500"><Check className="h-4 w-4 shrink-0 text-zinc-300" />Coming soon: {p.features.filter((f) => f.soon).map((f) => f.label).join(", ")}</li>
              </ul>
              <Button className="mt-5 w-full" variant={featured ? "primary" : "secondary"} onClick={() => setCheckout(p.id)}>Subscribe to {p.name}</Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader title="Payment history" />
        <Table>
          <thead><tr><Th>Date</Th><Th>Description</Th><Th>Method</Th><Th className="text-right">Amount</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <Td>{date(p.date)}</Td>
                <Td>{p.description}</Td>
                <Td>{p.method}</Td>
                <Td className="text-right">{inr(p.amount)}</Td>
                <Td><Badge tone="green">Success</Badge></Td>
                <Td className="text-right"><span className="text-xs text-zinc-400">No invoice</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={!!plan}
        onClose={() => setCheckout(null)}
        title={`Subscribe to ${plan?.name}`}
        footer={<>
          <Button variant="secondary" onClick={() => setCheckout(null)}>Cancel</Button>
          <Button onClick={() => { setCheckout(null); toast("Redirecting to Razorpay… (demo)"); }}>Continue to Razorpay</Button>
        </>}
      >
        <dl className="space-y-2">
          <div className="flex justify-between"><dt>Plan</dt><dd className="font-medium text-zinc-900">{plan?.name}</dd></div>
          <div className="flex justify-between"><dt>Billed</dt><dd className="font-medium text-zinc-900">₹{plan?.price} every month</dd></div>
          <div className="flex justify-between"><dt>First charge</dt><dd className="font-medium text-zinc-900">{date(currentCreator.trialEnd)} (after trial)</dd></div>
        </dl>
        <p className="mt-4 text-xs">
          You&apos;ll set up an auto-pay mandate with Razorpay (UPI AutoPay or card). It renews monthly until you cancel. You can cancel any time from this page.
        </p>
      </Modal>
    </>
  );
}

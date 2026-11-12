"use client";

import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Modal, useToast } from "@/components/interactive";
import { Badge, Button, Callout, Card, CardHeader, cn, EmptyState, PageHeader, Progress, SubscriptionBadge, Table, Td, Th } from "@/components/ui";
import { PLANS, TRIAL_DAYS, type PlanId } from "@/lib/config";
import { date, daysBetween, inr } from "@/lib/format";
import { hasStorefront } from "@/lib/plan";
import type { SubscriptionStatus } from "@/lib/mock-data";
import { cancelPlan, startCheckout, verifyCheckout } from "./actions";

type Sub = {
  plan: PlanId;
  status: SubscriptionStatus;
  trial_start: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  hasMandate: boolean;
};
type Payment = { id: string; created_at: string; plan: PlanId | null; amount: number; status: string; method: string | null };

type RazorpayResponse = { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string };
type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };

function loadCheckout(): Promise<RazorpayCtor | null> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(w.Razorpay ?? null);
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });
}

const paymentTone: Record<string, "green" | "red" | "yellow" | "gray"> = { captured: "green", failed: "red", pending: "yellow", refunded: "gray" };
const paymentLabel: Record<string, string> = { captured: "Paid", failed: "Failed", pending: "Pending", refunded: "Refunded" };

export function BillingView({ sub, payments, activeCampaigns, paymentsReady }: { sub: Sub | null; payments: Payment[]; activeCampaigns: number; paymentsReady: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [checkout, setCheckout] = useState<PlanId | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, start] = useTransition();

  const now = new Date().toISOString();
  const inTrial = sub?.status === "trial";
  const daysLeft = inTrial && sub?.trial_end ? Math.max(0, daysBetween(now, sub.trial_end)) : 0;
  const currentPlan = PLANS.find((p) => p.id === sub?.plan);
  const paid = sub && ["active", "payment_pending", "past_due"].includes(sub.status);
  const chosen = PLANS.find((p) => p.id === checkout);

  const subscribe = (plan: PlanId) =>
    start(async () => {
      const res = await startCheckout(plan);
      if ("error" in res) { toast(res.error); return; }
      if ("changed" in res) { setCheckout(null); toast("Plan updated."); router.refresh(); return; }

      const Razorpay = await loadCheckout();
      if (!Razorpay) { toast("Couldn't load Razorpay. Check your connection and try again."); return; }
      setCheckout(null);
      new Razorpay({
        key: res.keyId,
        subscription_id: res.subscriptionId,
        name: "GettingDM",
        description: `${res.planName} plan`,
        prefill: res.prefill,
        theme: { color: "#3F79C9" },
        handler: (r: RazorpayResponse) =>
          start(async () => {
            const v = await verifyCheckout({ paymentId: r.razorpay_payment_id, subscriptionId: r.razorpay_subscription_id, signature: r.razorpay_signature });
            toast("error" in v ? v.error : "You're subscribed. Thank you!");
            router.refresh();
          }),
      }).open();
    });

  const cancel = () =>
    start(async () => {
      const res = await cancelPlan();
      setConfirmCancel(false);
      toast("error" in res ? res.error : inTrial ? "Auto-pay cancelled." : "Your plan will end at the close of this billing period.");
      router.refresh();
    });

  return (
    <>
      <PageHeader title="Subscription" description="Your plan, payments and auto-pay." />

      {!paymentsReady && (
        <div className="mb-6">
          <Callout tone="yellow" title="Payments are being set up">Online payments aren&apos;t switched on yet. Your free trial and features keep working in the meantime.</Callout>
        </div>
      )}
      {sub && ["payment_pending", "past_due"].includes(sub.status) && (
        <div className="mb-6">
          <Callout tone="red" title="Your last payment didn't go through">Razorpay will retry automatically. Make sure your UPI AutoPay or card mandate is active, or choose a plan again below.</Callout>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Current plan" action={sub ? <SubscriptionBadge status={sub.status} /> : undefined} />
          <div className="space-y-4 p-5">
            {inTrial ? (
              <>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-zinc-900">Free trial · {daysLeft} day{daysLeft === 1 ? "" : "s"} left</p>
                    {sub?.trial_start && sub.trial_end && <p className="text-xs text-zinc-500">{date(sub.trial_start)} to {date(sub.trial_end)}</p>}
                  </div>
                  <div className="mt-2"><Progress value={((TRIAL_DAYS - daysLeft) / TRIAL_DAYS) * 100} tone={daysLeft <= 7 ? "yellow" : "violet"} /></div>
                </div>
                <p className="text-sm text-zinc-600">
                  {sub?.hasMandate
                    ? `Auto-pay is set up for ${currentPlan?.name}. Your first charge of ₹${currentPlan?.price} is on ${sub.trial_end ? date(sub.trial_end) : "the day the trial ends"}.`
                    : "Everything is unlocked during the trial. Pick a plan before it ends so your campaigns keep running."}
                </p>
              </>
            ) : paid && currentPlan ? (
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-zinc-900">{currentPlan.name}</p>
                  <p className="text-sm text-zinc-500">₹{currentPlan.price} per month</p>
                </div>
                {sub?.current_period_end && (
                  <p className="text-sm text-zinc-600">
                    {sub.cancel_at_period_end ? "Ends on " : "Renews on "}<span className="font-medium text-zinc-900">{date(sub.current_period_end)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">You don&apos;t have an active plan. Campaigns are paused until you subscribe.</p>
            )}

            {sub?.hasMandate && !sub.cancel_at_period_end && (inTrial || paid) && (
              <button type="button" onClick={() => setConfirmCancel(true)} className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-red-600 hover:underline">
                Cancel {inTrial ? "auto-pay" : "plan"}
              </button>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Your usage" />
          <dl className="space-y-4 p-5 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Active campaigns</dt><dd className="font-medium">{activeCampaigns} <span className="text-zinc-400">/ unlimited</span></dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">DMs</dt><dd className="font-medium">Unlimited</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Storefront</dt><dd className="font-medium">{hasStorefront(sub) ? "Included" : "Creator Plus"}</dd></div>
          </dl>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-zinc-900">{paid || sub?.hasMandate ? "Change plan" : "Choose a plan"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => {
          const featured = p.id === "creator_plus";
          const isCurrent = (paid || sub?.hasMandate) && sub?.plan === p.id;
          return (
            <Card key={p.id} className={cn("flex flex-col p-5", featured && "border-2 border-violet-500")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.name}</p>
                {isCurrent ? <Badge tone="green">Current plan</Badge> : featured && <Badge tone="violet">Recommended</Badge>}
              </div>
              <p className="mt-1 text-sm text-zinc-500">{p.tagline}</p>
              <p className="mt-3"><span className="text-3xl font-semibold">₹{p.price}</span><span className="text-sm text-zinc-500">/month</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.features.filter((f) => f.highlight).map((f) => (
                  <li key={f.label} className="flex gap-2 font-semibold text-pink-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />{f.label}</li>
                ))}
                {p.features.filter((f) => !f.soon && !f.highlight).map((f) => (
                  <li key={f.label} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" /><span>{f.label}{f.value !== "Included" && <span className="text-zinc-500"> · {f.value}</span>}</span></li>
                ))}
                {p.features.some((f) => f.soon) && (
                  <li className="flex gap-2 text-zinc-500"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />Coming soon: {p.features.filter((f) => f.soon).map((f) => f.label).join(", ")}</li>
                )}
              </ul>
              <Button className="mt-5 w-full" variant={featured ? "primary" : "secondary"} disabled={isCurrent || busy || !paymentsReady} onClick={() => setCheckout(p.id)}>
                {isCurrent ? "Your current plan" : paid || sub?.hasMandate ? `Switch to ${p.name}` : `Subscribe to ${p.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500"><ShieldCheck className="h-3.5 w-3.5" /> Payments are processed securely by Razorpay. UPI AutoPay and cards supported. Prices include applicable taxes.</p>

      <Card className="mt-8">
        <CardHeader title="Payment history" />
        {payments.length === 0 ? (
          <EmptyState title="No payments yet" description="Your invoices will show up here after your first charge." />
        ) : (
          <Table>
            <thead><tr><Th>Date</Th><Th>Plan</Th><Th>Method</Th><Th className="text-right">Amount</Th><Th>Status</Th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <Td>{date(p.created_at)}</Td>
                  <Td>{PLANS.find((x) => x.id === p.plan)?.name ?? "Subscription"}</Td>
                  <Td className="capitalize">{p.method ?? "—"}</Td>
                  <Td className="text-right">{inr(p.amount / 100)}</Td>
                  <Td><Badge tone={paymentTone[p.status] ?? "gray"}>{paymentLabel[p.status] ?? p.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!chosen}
        onClose={() => setCheckout(null)}
        title={paid || sub?.hasMandate ? `Switch to ${chosen?.name}` : `Subscribe to ${chosen?.name}`}
        footer={<>
          <Button variant="secondary" onClick={() => setCheckout(null)}>Cancel</Button>
          <Button disabled={busy} onClick={() => checkout && subscribe(checkout)}><CreditCard className="h-4 w-4" /> {busy ? "Please wait…" : paid || sub?.hasMandate ? "Confirm switch" : "Continue to Razorpay"}</Button>
        </>}
      >
        <dl className="space-y-2">
          <div className="flex justify-between"><dt>Plan</dt><dd className="font-medium text-zinc-900">{chosen?.name}</dd></div>
          <div className="flex justify-between"><dt>Billed</dt><dd className="font-medium text-zinc-900">₹{chosen?.price} every month</dd></div>
          <div className="flex justify-between">
            <dt>First charge</dt>
            <dd className="font-medium text-zinc-900">{inTrial && sub?.trial_end ? `${date(sub.trial_end)} (after trial)` : paid ? "Adjusted on your next bill" : "Today"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs">
          {paid || sub?.hasMandate
            ? "Your plan changes right away. Razorpay adjusts the amount on your next bill."
            : "You'll set up an auto-pay mandate with Razorpay (UPI AutoPay or card). It renews monthly until you cancel, and you can cancel any time from this page."}
        </p>
      </Modal>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={inTrial ? "Cancel auto-pay?" : "Cancel your plan?"}
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmCancel(false)}>Keep it</Button>
          <Button variant="danger" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Yes, cancel"}</Button>
        </>}
      >
        {inTrial
          ? "You won't be charged when the trial ends. Your campaigns pause at the end of the trial unless you pick a plan again."
          : `You keep ${currentPlan?.name} until ${sub?.current_period_end ? date(sub.current_period_end) : "the end of this billing period"}. After that, campaigns pause and you won't be charged again.`}
      </Modal>
    </>
  );
}

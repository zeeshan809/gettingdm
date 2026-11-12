import "server-only";
import { createServiceClient } from "./supabase/server";
import { fromUnix, mapStatus, planFromRazorpay, type RzPayment, type RzSubscription } from "./razorpay";

// Writes Razorpay's view of a subscription onto our subscriptions row.
// Used by the checkout callback and the webhook. Service role: creators can't write billing rows.
export async function applySubscription(creatorId: string, rz: RzSubscription) {
  const svc = createServiceClient();
  const { data: current } = await svc.from("subscriptions").select("status").eq("creator_id", creatorId).maybeSingle();
  const status = mapStatus(rz.status, current?.status ?? "trial");
  const plan = planFromRazorpay(rz.plan_id);

  const patch: Record<string, unknown> = { razorpay_subscription_id: rz.id };
  if (status) patch.status = status;
  if (plan) patch.plan = plan;
  if (rz.current_start) patch.current_period_start = fromUnix(rz.current_start);
  if (rz.current_end) patch.current_period_end = fromUnix(rz.current_end);
  if (rz.status === "active") patch.cancel_at_period_end = false;

  const { error } = await svc.from("subscriptions").update(patch as never).eq("creator_id", creatorId);
  if (error) throw error;
}

// Records a payment once; Razorpay retries webhooks, so this is idempotent.
export async function recordPayment(creatorId: string, subscriptionId: string, p: RzPayment) {
  const svc = createServiceClient();
  const status = p.status === "captured" ? "captured" : p.status === "refunded" ? "refunded" : p.status === "failed" ? "failed" : "pending";
  const { data: sub } = await svc.from("subscriptions").select("plan").eq("creator_id", creatorId).maybeSingle();
  const { error } = await svc.from("payments").upsert(
    {
      creator_id: creatorId,
      razorpay_payment_id: p.id,
      razorpay_invoice_id: p.invoice_id ?? null,
      razorpay_subscription_id: subscriptionId,
      plan: sub?.plan ?? null,
      amount: p.amount,
      currency: p.currency ?? "INR",
      status,
      method: p.method ?? null,
      failure_reason: p.error_description ?? null,
    },
    { onConflict: "razorpay_payment_id" },
  );
  if (error) throw error;
}

// Finds which creator a Razorpay subscription belongs to.
export async function creatorForSubscription(rz: { id: string; notes?: Record<string, string> }) {
  const { data } = await createServiceClient().from("subscriptions").select("creator_id").eq("razorpay_subscription_id", rz.id).maybeSingle();
  return data?.creator_id ?? rz.notes?.creator_id ?? null;
}

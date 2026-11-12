"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/auth";
import { applySubscription } from "@/lib/billing-server";
import { PLANS, type PlanId } from "@/lib/config";
import {
  cancelSubscription, changeSubscriptionPlan, createSubscription, fetchSubscription,
  razorpayConfigured, razorpayKeyId, validCheckoutSignature,
} from "@/lib/razorpay";
import { createServiceClient } from "@/lib/supabase/server";

type Fail = { error: string };

const NOT_READY = "Payments aren't switched on yet. Please try again soon or contact support.";

async function mySubscription(creatorId: string) {
  const { data } = await createServiceClient()
    .from("subscriptions")
    .select("plan, status, trial_end, razorpay_subscription_id")
    .eq("creator_id", creatorId)
    .maybeSingle();
  return data;
}

// Starts checkout for a plan. Returns what Razorpay Checkout needs, or switches the plan
// in place when the creator already has a live subscription.
export async function startCheckout(plan: PlanId): Promise<Fail | { changed: true } | {
  subscriptionId: string; keyId: string; planName: string; prefill: { name: string; email: string };
}> {
  if (!PLANS.some((p) => p.id === plan)) return { error: "Unknown plan." };
  if (!razorpayConfigured()) return { error: NOT_READY };

  const creator = await getCurrentCreator();
  const sub = await mySubscription(creator.id);

  try {
    if (sub?.razorpay_subscription_id) {
      const existing = await fetchSubscription(sub.razorpay_subscription_id);
      if (existing.status === "active" || existing.status === "authenticated") {
        if (sub.plan === plan) return { error: "You're already on this plan." };
        const updated = await changeSubscriptionPlan(existing.id, plan);
        await applySubscription(creator.id, updated);
        revalidatePath("/", "layout");
        return { changed: true };
      }
      // An unfinished checkout ("created") or an ended subscription: start fresh.
      if (existing.status === "created") await cancelSubscription(existing.id, false).catch(() => {});
    }

    // During the free trial the first charge is scheduled for the day the trial ends.
    const trialEnd = sub?.status === "trial" && sub.trial_end ? Math.floor(new Date(sub.trial_end).getTime() / 1000) : 0;
    const startAt = trialEnd > Date.now() / 1000 + 60 ? trialEnd : undefined;

    const created = await createSubscription({ plan, creatorId: creator.id, startAt });
    await createServiceClient().from("subscriptions").update({ razorpay_subscription_id: created.id }).eq("creator_id", creator.id);

    return {
      subscriptionId: created.id,
      keyId: razorpayKeyId(),
      planName: PLANS.find((p) => p.id === plan)!.name,
      prefill: { name: creator.full_name || creator.username, email: creator.email ?? "" },
    };
  } catch (e) {
    console.error("razorpay checkout failed", e);
    return { error: e instanceof Error ? e.message : "Couldn't start checkout. Please try again." };
  }
}

// Called by Razorpay Checkout's success handler. Verifies the signature, then syncs the plan.
export async function verifyCheckout(input: { paymentId: string; subscriptionId: string; signature: string }): Promise<Fail | { ok: true }> {
  if (!razorpayConfigured()) return { error: NOT_READY };
  const creator = await getCurrentCreator();
  const sub = await mySubscription(creator.id);

  if (!sub || sub.razorpay_subscription_id !== input.subscriptionId) return { error: "This payment doesn't match your account." };
  if (!validCheckoutSignature(input.paymentId, input.subscriptionId, input.signature)) return { error: "We couldn't verify this payment." };

  try {
    await applySubscription(creator.id, await fetchSubscription(input.subscriptionId));
  } catch (e) {
    console.error("razorpay verify sync failed", e);
    // The webhook will still bring the subscription up to date.
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// Cancels at the end of the paid period (or right away during the trial).
export async function cancelPlan(): Promise<Fail | { ok: true }> {
  if (!razorpayConfigured()) return { error: NOT_READY };
  const creator = await getCurrentCreator();
  const sub = await mySubscription(creator.id);
  if (!sub?.razorpay_subscription_id) return { error: "You don't have a paid plan to cancel." };

  try {
    const inTrial = sub.status === "trial";
    await cancelSubscription(sub.razorpay_subscription_id, !inTrial);
    await createServiceClient()
      .from("subscriptions")
      .update(inTrial ? { razorpay_subscription_id: null, plan: "creator" } : { cancel_at_period_end: true })
      .eq("creator_id", creator.id);
  } catch (e) {
    console.error("razorpay cancel failed", e);
    return { error: e instanceof Error ? e.message : "Couldn't cancel. Please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

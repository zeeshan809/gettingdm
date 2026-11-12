import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PlanId } from "./config";

// Minimal Razorpay Subscriptions client (REST, no SDK).
// Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
//      RAZORPAY_PLAN_CREATOR, RAZORPAY_PLAN_CREATOR_PLUS (plan ids from the Razorpay dashboard).

const API = "https://api.razorpay.com/v1";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_PLAN_CREATOR && process.env.RAZORPAY_PLAN_CREATOR_PLUS);
}

export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID ?? "";

export function razorpayPlanId(plan: PlanId) {
  return plan === "creator_plus" ? process.env.RAZORPAY_PLAN_CREATOR_PLUS! : process.env.RAZORPAY_PLAN_CREATOR!;
}

export function planFromRazorpay(planId: string | null | undefined): PlanId | null {
  if (!planId) return null;
  if (planId === process.env.RAZORPAY_PLAN_CREATOR_PLUS) return "creator_plus";
  if (planId === process.env.RAZORPAY_PLAN_CREATOR) return "creator";
  return null;
}

export class RazorpayError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function call<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new RazorpayError(data?.error?.description ?? `Razorpay request failed (${res.status})`, res.status);
  return data as T;
}

export type RzSubscription = {
  id: string;
  plan_id: string;
  status: "created" | "authenticated" | "active" | "pending" | "halted" | "cancelled" | "completed" | "expired" | "paused";
  current_start: number | null;
  current_end: number | null;
  notes?: Record<string, string>;
};

export type RzPayment = {
  id: string;
  amount: number; // paise
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
  invoice_id?: string | null;
  error_description?: string | null;
};

export function createSubscription(opts: { plan: PlanId; creatorId: string; startAt?: number }) {
  return call<RzSubscription & { short_url: string }>("POST", "/subscriptions", {
    plan_id: razorpayPlanId(opts.plan),
    total_count: 120, // monthly for up to 10 years, until cancelled
    customer_notify: 1,
    ...(opts.startAt ? { start_at: opts.startAt } : {}),
    notes: { creator_id: opts.creatorId, plan: opts.plan },
  });
}

export const fetchSubscription = (id: string) => call<RzSubscription>("GET", `/subscriptions/${id}`);

export const changeSubscriptionPlan = (id: string, plan: PlanId) =>
  call<RzSubscription>("PATCH", `/subscriptions/${id}`, { plan_id: razorpayPlanId(plan), schedule_change_at: "now", customer_notify: 1 });

export const cancelSubscription = (id: string, atCycleEnd: boolean) =>
  call<RzSubscription>("POST", `/subscriptions/${id}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 });

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Checkout handler signature: HMAC(payment_id + "|" + subscription_id, key secret).
export function validCheckoutSignature(paymentId: string, subscriptionId: string, signature: string) {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "").update(`${paymentId}|${subscriptionId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

// Webhook signature: HMAC of the exact raw body with the webhook secret.
export function validWebhookSignature(raw: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqualHex(createHmac("sha256", secret).update(raw).digest("hex"), signature);
}

// Razorpay subscription status -> our subscription_status.
export function mapStatus(s: RzSubscription["status"], current: string) {
  switch (s) {
    case "active": return "active" as const;
    case "authenticated": return current === "trial" ? ("trial" as const) : ("active" as const); // mandate set, first charge after trial
    case "pending": return "payment_pending" as const;
    case "halted": return "past_due" as const;
    case "cancelled": return "cancelled" as const;
    case "completed":
    case "expired": return "expired" as const;
    case "paused": return "suspended" as const;
    default: return null; // "created": checkout not finished, nothing changes
  }
}

export const fromUnix = (t: number | null | undefined) => (t ? new Date(t * 1000).toISOString() : null);

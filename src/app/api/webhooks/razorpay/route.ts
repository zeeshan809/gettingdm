import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { applySubscription, creatorForSubscription, recordPayment } from "@/lib/billing-server";
import { validWebhookSignature, type RzPayment, type RzSubscription } from "@/lib/razorpay";
import { createServiceClient } from "@/lib/supabase/server";

// Razorpay webhook. Configure in Razorpay Dashboard > Webhooks with the URL
// https://<domain>/api/webhooks/razorpay, the RAZORPAY_WEBHOOK_SECRET, and the
// subscription.* and payment.failed events.

type Event = {
  event: string;
  payload: {
    subscription?: { entity: RzSubscription };
    payment?: { entity: RzPayment & { subscription_id?: string } };
  };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!validWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: Event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Razorpay retries deliveries; store each event once and skip repeats.
  const svc = createServiceClient();
  const id = `razorpay_${request.headers.get("x-razorpay-event-id") ?? createHash("sha256").update(raw).digest("hex")}`;
  const { error: insertError } = await svc.from("webhook_events").insert({ id, provider: "razorpay", payload: event as never });
  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    console.error("razorpay webhook store failed", insertError);
    return new NextResponse("Error", { status: 500 });
  }

  try {
    const sub = event.payload.subscription?.entity;
    const payment = event.payload.payment?.entity;
    const subId = sub?.id ?? payment?.subscription_id;
    const creatorId = sub ? await creatorForSubscription(sub) : subId ? await creatorForSubscription({ id: subId }) : null;

    if (creatorId) {
      if (sub && event.event.startsWith("subscription.")) await applySubscription(creatorId, sub);
      if (payment && subId) await recordPayment(creatorId, subId, payment);
    }
    await svc.from("webhook_events").update({ processed_at: new Date().toISOString(), error: creatorId ? null : "No matching creator" }).eq("id", id);
  } catch (e) {
    console.error("razorpay webhook processing failed", e);
    // Drop the stored event so Razorpay's retry is processed again.
    await svc.from("webhook_events").delete().eq("id", id);
    return new NextResponse("Error", { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

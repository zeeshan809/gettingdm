import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { processMetaPayload } from "@/lib/dm-worker";
import { createServiceClient } from "@/lib/supabase/server";

// Meta webhook endpoint (Instagram comments, messages).
// GET: Meta's one-time subscription check. POST: signed event deliveries,
// stored raw in webhook_events, then processed by the comment-to-DM worker right
// after the response is sent (the minute worker picks up anything missed).

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (expected && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === expected) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// X-Hub-Signature-256 is an HMAC of the exact raw body with the app secret.
function validSignature(raw: string, header: string | null) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const given = Buffer.from(header.slice("sha256=".length));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Meta sends no delivery id and retries on failure, so the body hash makes
  // redeliveries idempotent.
  const id = `meta_${createHash("sha256").update(raw).digest("hex")}`;
  const { data: stored, error } = await createServiceClient()
    .from("webhook_events")
    .upsert({ id, provider: "meta", payload: payload as never }, { onConflict: "id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("meta webhook store failed", error);
    // Non-2xx makes Meta retry later.
    return new NextResponse("Error", { status: 500 });
  }
  // Only new deliveries are processed; a redelivery returns no row.
  if (stored?.length) after(() => processMetaPayload(id, payload as never));
  return new NextResponse("OK", { status: 200 });
}

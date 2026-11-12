import { randomInt } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { parseSignedRequest } from "@/lib/meta";
import { createServiceClient } from "@/lib/supabase/server";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const confirmationCode = () => Array.from({ length: 12 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");

// Meta's "Data Deletion Request Callback". Deletes the Instagram connection
// and token for this Meta user and returns a status URL + confirmation code.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""));
  if (!data) return NextResponse.json({ error: "Invalid signed_request" }, { status: 400 });

  const svc = createServiceClient();
  const { data: accounts } = await svc.from("instagram_accounts").select("creator_id").eq("fb_user_id", data.user_id);
  for (const { creator_id } of accounts ?? []) {
    // All Instagram data received through this connection: the connection and token
    // (token cascades), commenter records, and post captions/thumbnails on campaigns.
    await svc.from("instagram_accounts").delete().eq("creator_id", creator_id);
    await svc.from("comment_events").delete().eq("creator_id", creator_id);
    await svc.from("campaigns").update({ active: false, media_caption: null, media_thumbnail_url: null }).eq("creator_id", creator_id);
  }

  const code = confirmationCode();
  const { error } = await svc.from("data_deletion_requests").insert({
    confirmation_code: code,
    fb_user_id: data.user_id,
    creator_id: accounts?.[0]?.creator_id ?? null,
    status: "completed",
    completed_at: new Date().toISOString(),
  });
  if (error) {
    console.error("data deletion record failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ url: new URL(`/data-deletion?code=${code}`, request.url).toString(), confirmation_code: code });
}

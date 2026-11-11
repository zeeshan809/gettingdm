import { NextResponse, type NextRequest } from "next/server";
import { parseSignedRequest } from "@/lib/meta";
import { createServiceClient } from "@/lib/supabase/server";

// Meta's "Deauthorize Callback": the person removed the app in Facebook/Instagram
// settings. Drop the token, mark the connection revoked and tell the creator.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const data = parseSignedRequest(String(form?.get("signed_request") ?? ""));
  if (!data) return NextResponse.json({ error: "Invalid signed_request" }, { status: 400 });

  const svc = createServiceClient();
  const { data: accounts } = await svc.from("instagram_accounts").select("creator_id, username").eq("fb_user_id", data.user_id);
  for (const a of accounts ?? []) {
    await svc.from("instagram_tokens").delete().eq("creator_id", a.creator_id);
    await svc.from("instagram_accounts").update({ status: "revoked", last_error: "App removed in Meta settings" }).eq("creator_id", a.creator_id);
    await svc.rpc("notify", {
      p_creator: a.creator_id, p_type: "instagram_revoked", p_tone: "danger",
      p_title: "Instagram disconnected", p_body: `Access for @${a.username} was removed in Meta settings. Reconnect to resume automations.`, p_link: "/instagram",
    });
  }
  return NextResponse.json({ ok: true });
}

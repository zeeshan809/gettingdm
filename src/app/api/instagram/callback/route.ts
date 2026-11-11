import { NextResponse, type NextRequest } from "next/server";
import { getCurrentCreator } from "@/lib/auth";
import { OAUTH_COOKIE, RETURN_PATHS } from "@/lib/instagram-oauth";
import { assignedInstagramAccounts, exchangeCode, metaConfig, MetaError, subscribeInstagram } from "@/lib/meta";
import { createServiceClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/token-crypto";

// Meta redirects here after the creator approves (or cancels) the login.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? "{}");
  } catch {}
  const next = RETURN_PATHS.includes(saved.next ?? "") ? saved.next! : "/instagram";

  const finish = (query: string) => {
    const res = NextResponse.redirect(new URL(`${next}?${query}`, request.url));
    res.cookies.delete({ name: OAUTH_COOKIE, path: "/api/instagram" });
    return res;
  };

  if (params.get("error")) return finish("error=cancelled");
  if (!saved.state || params.get("state") !== saved.state) return finish("error=state");
  const code = params.get("code");
  if (!code || !metaConfig()) return finish("error=failed");

  const creator = await getCurrentCreator();
  const redirectUri = new URL("/api/instagram/callback", request.url).toString();

  try {
    const token = await exchangeCode(code, redirectUri);
    const accounts = await assignedInstagramAccounts(token);
    // The configuration requires an Instagram account; if several were shared, use the first.
    const ig = accounts[0];
    if (!ig) return finish("error=no_instagram");

    const svc = createServiceClient();
    const { data: other } = await svc.from("instagram_accounts").select("creator_id").eq("ig_user_id", ig.igUserId).neq("creator_id", creator.id).maybeSingle();
    if (other) return finish("error=already_connected");

    let lastError: string | null = null;
    try {
      await subscribeInstagram(ig.igUserId, token);
    } catch (e) {
      lastError = `Comment notifications not enabled: ${(e as Error).message}`;
      console.error("subscribeInstagram failed", e);
    }

    const { error: accErr } = await svc.from("instagram_accounts").upsert({
      creator_id: creator.id,
      ig_user_id: ig.igUserId,
      username: ig.username,
      profile_picture_url: ig.profilePictureUrl,
      account_type: "professional",
      status: "connected",
      token_expires_at: null,
      connected_at: new Date().toISOString(),
      last_error: lastError,
      fb_user_id: ig.systemUserId,
      business_id: ig.businessId,
      page_id: null,
      page_name: null,
    }, { onConflict: "creator_id" });
    if (accErr) throw accErr;

    const { error: tokErr } = await svc.from("instagram_tokens").upsert(
      { creator_id: creator.id, access_token_encrypted: encryptToken(token) },
      { onConflict: "creator_id" },
    );
    if (tokErr) throw tokErr;

    await svc.rpc("notify", {
      p_creator: creator.id, p_type: "instagram_connected", p_tone: "success",
      p_title: `Instagram connected: @${ig.username}`, p_body: "Your campaigns can now reply to comments on this account.", p_link: "/instagram",
    });
    return finish("connected=1");
  } catch (e) {
    console.error("instagram connect failed", e);
    return finish(e instanceof MetaError && e.permissionMissing ? "error=permissions" : "error=failed");
  }
}

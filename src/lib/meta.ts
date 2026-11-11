import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Meta Graph API for Facebook Login for Business (Unified login) with an
// Instagram professional account linked to a Facebook Page.

export const GRAPH_VERSION = "v27.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function metaConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const configId = process.env.META_LOGIN_CONFIG_ID;
  return appId && appSecret && configId ? { appId, appSecret, configId } : null;
}

export class MetaError extends Error {
  constructor(message: string, readonly code?: number, readonly subcode?: number) {
    super(message);
  }
  // 190 = invalid/expired token, 102 = session error, 10/200-299 = permission removed.
  get tokenInvalid() {
    return this.code === 190 || this.code === 102;
  }
  get permissionMissing() {
    return this.code === 10 || (this.code !== undefined && this.code >= 200 && this.code < 300);
  }
}

// Proves the call comes from our server; required if "Require App Secret" is on.
const proof = (token: string) => createHmac("sha256", process.env.META_APP_SECRET ?? "").update(token).digest("hex");

async function graph<T>(path: string, params: Record<string, string>, init?: { method?: "GET" | "POST" | "DELETE" }): Promise<T> {
  const qs = new URLSearchParams(params);
  if (params.access_token) qs.set("appsecret_proof", proof(params.access_token));
  const res = await fetch(`${GRAPH}${path}?${qs}`, { method: init?.method ?? "GET", cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const e = body.error ?? {};
    throw new MetaError(e.message ?? `Meta API error ${res.status}`, e.code, e.error_subcode);
  }
  return body as T;
}

export function authorizeUrl(redirectUri: string, state: string) {
  const cfg = metaConfig()!;
  const qs = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: redirectUri,
    config_id: cfg.configId,
    response_type: "code",
    override_default_response_type: "true",
    state,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${qs}`;
}

// Login code → short-lived user token → long-lived (~60 day) user token.
// Page tokens fetched with a long-lived user token don't expire.
export async function exchangeCode(code: string, redirectUri: string) {
  const cfg = metaConfig()!;
  const short = await graph<{ access_token: string }>("/oauth/access_token", {
    client_id: cfg.appId, client_secret: cfg.appSecret, redirect_uri: redirectUri, code,
  });
  const long = await graph<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    grant_type: "fb_exchange_token", client_id: cfg.appId, client_secret: cfg.appSecret, fb_exchange_token: short.access_token,
  });
  return long.access_token;
}

export type LinkedInstagram = {
  fbUserId: string;
  pageId: string;
  pageName: string;
  pageToken: string;
  igUserId: string;
  username: string;
  profilePictureUrl: string | null;
};

// Pages the person granted, keeping only those with a linked Instagram professional account.
export async function linkedInstagramAccounts(userToken: string): Promise<LinkedInstagram[]> {
  const me = await graph<{ id: string }>("/me", { fields: "id", access_token: userToken });
  const pages = await graph<{
    data: { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string; profile_picture_url?: string } }[];
  }>("/me/accounts", {
    fields: "id,name,access_token,instagram_business_account{id,username,profile_picture_url}",
    access_token: userToken,
  });
  return pages.data
    .filter((p) => p.instagram_business_account)
    .map((p) => ({
      fbUserId: me.id,
      pageId: p.id,
      pageName: p.name,
      pageToken: p.access_token,
      igUserId: p.instagram_business_account!.id,
      username: p.instagram_business_account!.username ?? "",
      profilePictureUrl: p.instagram_business_account!.profile_picture_url ?? null,
    }));
}

// Instagram webhooks for a Page-linked account only arrive once the app is subscribed to the Page.
export async function subscribePage(pageId: string, pageToken: string) {
  await graph(`/${pageId}/subscribed_apps`, { subscribed_fields: "feed", access_token: pageToken }, { method: "POST" });
}

export async function unsubscribePage(pageId: string, pageToken: string) {
  await graph(`/${pageId}/subscribed_apps`, { access_token: pageToken }, { method: "DELETE" });
}

export type GraphMedia = {
  id: string;
  caption?: string;
  media_type: string;
  media_product_type?: string;
  thumbnail_url?: string;
  media_url?: string;
  permalink?: string;
  timestamp: string;
};

export async function recentMedia(igUserId: string, pageToken: string, limit = 24) {
  const res = await graph<{ data: GraphMedia[] }>(`/${igUserId}/media`, {
    fields: "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp",
    limit: String(limit),
    access_token: pageToken,
  });
  return res.data;
}

// Meta's signed_request (data-deletion and deauthorize callbacks):
// "<base64url HMAC-SHA256 signature>.<base64url JSON payload>", signed with the app secret.
export function parseSignedRequest(signedRequest: string): { user_id: string; issued_at?: number } | null {
  const secret = process.env.META_APP_SECRET;
  const [sig, payload] = signedRequest.split(".");
  if (!secret || !sig || !payload) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.algorithm?.toUpperCase() === "HMAC-SHA256" && typeof data.user_id === "string" ? data : null;
  } catch {
    return null;
  }
}

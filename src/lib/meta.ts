import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Meta Graph API for "Instagram API with Unified Login": Facebook Login for
// Business with a system-user configuration. Creators log in with Instagram or
// Facebook; no Facebook Page is needed. The login returns a Business
// Integration System User token owned by the creator's business portfolio.

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

// Mirrors the Login URL Meta generates for an "Instagram Login Compatible"
// configuration. prompt=login shows the Instagram/Facebook login choice
// instead of silently reusing whichever Facebook account is signed in.
export function authorizeUrl(redirectUri: string, state: string) {
  const cfg = metaConfig()!;
  const qs = new URLSearchParams({
    client_id: cfg.appId,
    config_id: cfg.configId,
    display: "popup",
    override_default_response_type: "true",
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    prompt: "login",
  });
  return `https://www.facebook.com/dialog/oauth?${qs}`;
}

// Login code → Business Integration System User token (its lifetime is set
// by the login configuration; ours never expires).
export async function exchangeCode(code: string, redirectUri: string) {
  const cfg = metaConfig()!;
  const res = await graph<{ access_token: string }>("/oauth/access_token", {
    client_id: cfg.appId, client_secret: cfg.appSecret, redirect_uri: redirectUri, code,
  });
  return res.access_token;
}

export type ConnectedInstagram = {
  systemUserId: string;
  businessId: string | null;
  igUserId: string;
  username: string;
  profilePictureUrl: string | null;
};

// Instagram accounts the creator shared during login. /me is the system user,
// not the Instagram account.
export async function assignedInstagramAccounts(token: string): Promise<ConnectedInstagram[]> {
  const me = await graph<{ id: string; client_business_id?: string }>("/me", { fields: "id,client_business_id", access_token: token });
  const accounts = await graph<{ data: { id: string; username?: string; profile_picture_url?: string }[] }>(
    "/me/assigned_instagram_accounts",
    { fields: "id,username,profile_picture_url", access_token: token },
  );
  return accounts.data.map((a) => ({
    systemUserId: me.id,
    businessId: me.client_business_id ?? null,
    igUserId: a.id,
    username: a.username ?? "",
    profilePictureUrl: a.profile_picture_url ?? null,
  }));
}

// Webhooks for a connected account only arrive once it's subscribed.
// comments: comment-to-DM. messages / messaging_postbacks: replies and button taps (Follow
// before DM). standby: the same, when another app is the account's primary receiver.
export async function subscribeInstagram(igUserId: string, token: string) {
  await graph(`/${igUserId}/subscribed_apps`, { subscribed_fields: "comments,messages,messaging_postbacks,standby", access_token: token }, { method: "POST" });
}

// ---------- Messaging ----------

async function graphPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const qs = new URLSearchParams({ access_token: token, appsecret_proof: proof(token) });
  const res = await fetch(`${GRAPH}${path}?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = data.error ?? {};
    throw new MetaError(e.message ?? `Meta API error ${res.status}`, e.code, e.error_subcode);
  }
  return data as T;
}

export type QuickReply = { title: string; payload: string };

const withQuickReplies = (text: string, quickReplies?: QuickReply[]) => ({
  text,
  ...(quickReplies?.length
    ? { quick_replies: quickReplies.map((q) => ({ content_type: "text", title: q.title.slice(0, 20), payload: q.payload })) }
    : {}),
});

// Private reply to a comment (allowed once, within 7 days of the comment).
// Returns the commenter's Instagram-scoped id (IGSID).
export async function sendPrivateReply(igUserId: string, token: string, commentId: string, text: string, quickReplies?: QuickReply[]) {
  return graphPost<{ recipient_id: string; message_id: string }>(`/${igUserId}/messages`, token, {
    recipient: { comment_id: commentId },
    message: withQuickReplies(text, quickReplies),
  });
}

// Regular DM to someone who messaged the account in the last 24 hours.
export async function sendMessage(igUserId: string, token: string, igsid: string, text: string, quickReplies?: QuickReply[]) {
  return graphPost<{ recipient_id: string; message_id: string }>(`/${igUserId}/messages`, token, {
    recipient: { id: igsid },
    message: withQuickReplies(text, quickReplies),
  });
}

// Text with a tappable link button (Instagram "button template") instead of a pasted URL.
// recipient: { comment_id } for the private reply to a comment, { id } for a regular DM.
export async function sendLinkButton(
  igUserId: string,
  token: string,
  recipient: { comment_id: string } | { id: string },
  text: string,
  button: { title: string; url: string },
) {
  return graphPost<{ recipient_id: string; message_id: string }>(`/${igUserId}/messages`, token, {
    recipient,
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text.slice(0, 640),
          buttons: [{ type: "web_url", url: button.url, title: button.title.slice(0, 20) }],
        },
      },
    },
  });
}

// Needs the person's consent, which they give by messaging the account.
export async function followsAccount(igsid: string, token: string) {
  const res = await graph<{ is_user_follow_business?: boolean }>(`/${igsid}`, { fields: "is_user_follow_business", access_token: token });
  return res.is_user_follow_business === true;
}

// Reading DM threads. Meta doesn't send us message webhooks for every account, so the
// minute worker reads threads to see who tapped "I've followed".
type Conversation = { id: string; updated_time: string; participants: { data: { id: string; username?: string }[] } };
export type ThreadMessage = { id: string; created_time: string; from?: { id: string }; message?: string };

// Meta returns "+0000"-style offsets; normalise so Date parses them everywhere.
export const metaTime = (t: string) => new Date(t.replace(/([+-]\d\d)(\d\d)$/, "$1:$2")).getTime();

export async function recentConversations(igUserId: string, token: string, limit = 50) {
  const res = await graph<{ data: Conversation[] }>(`/${igUserId}/conversations`, {
    platform: "instagram",
    fields: "participants,updated_time",
    limit: String(limit),
    access_token: token,
  });
  // participant id (IGSID) -> thread
  const byPerson = new Map<string, { id: string; updated: number }>();
  for (const c of res.data ?? []) {
    const other = c.participants?.data?.find((p) => p.id !== igUserId);
    if (other) byPerson.set(other.id, { id: c.id, updated: metaTime(c.updated_time) });
  }
  return byPerson;
}

export async function conversationMessages(conversationId: string, token: string, limit = 10) {
  const res = await graph<{ messages?: { data: ThreadMessage[] } }>(`/${conversationId}`, {
    fields: `messages.limit(${limit}){id,from,created_time,message}`,
    access_token: token,
  });
  return res.messages?.data ?? [];
}

export async function unsubscribeInstagram(igUserId: string, token: string) {
  await graph(`/${igUserId}/subscribed_apps`, { access_token: token }, { method: "DELETE" });
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

export async function recentMedia(igUserId: string, token: string, limit = 24) {
  const res = await graph<{ data: GraphMedia[] }>(`/${igUserId}/media`, {
    fields: "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp",
    limit: String(limit),
    access_token: token,
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

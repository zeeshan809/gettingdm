import "server-only";
import { cache } from "react";
import { createClient, createServiceClient } from "./supabase/server";
import { decryptToken } from "./token-crypto";
import { MetaError, recentMedia, subscribeInstagram, unsubscribeInstagram } from "./meta";
import type { InstagramMedia } from "./campaigns";

// Placeholder posts so campaigns can be built and tested locally before
// Instagram is connected. Never offered in production.
const SAMPLE_MEDIA: InstagramMedia[] = [
  { id: "sample_reel_1", type: "Reel", caption: "Sample Reel · 5 Python tricks nobody teaches you", thumbnailUrl: null, permalink: null, postedAt: "2026-11-02T10:00:00Z" },
  { id: "sample_reel_2", type: "Reel", caption: "Sample Reel · Excel shortcuts that save hours", thumbnailUrl: null, permalink: null, postedAt: "2026-10-28T10:00:00Z" },
  { id: "sample_post_3", type: "Post", caption: "Sample Post · SQL interview cheat sheet", thumbnailUrl: null, permalink: null, postedAt: "2026-10-21T10:00:00Z" },
  { id: "sample_reel_4", type: "Reel", caption: "Sample Reel · Power BI dashboard in 60 seconds", thumbnailUrl: null, permalink: null, postedAt: "2026-10-15T10:00:00Z" },
  { id: "sample_post_5", type: "Post", caption: "Sample Post · My desk setup for coding", thumbnailUrl: null, permalink: null, postedAt: "2026-10-09T10:00:00Z" },
  { id: "sample_reel_6", type: "Reel", caption: "Sample Reel · 3 ChatGPT prompts for analysts", thumbnailUrl: null, permalink: null, postedAt: "2026-10-03T10:00:00Z" },
];

export const getInstagramAccount = cache(async (creatorId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instagram_accounts")
    .select("ig_user_id, username, profile_picture_url, status, connected_at, last_error")
    .eq("creator_id", creatorId)
    .maybeSingle();
  return data;
});

// Server-only: decrypted access token for Graph calls.
export async function accessToken(creatorId: string) {
  const { data } = await createServiceClient().from("instagram_tokens").select("access_token_encrypted").eq("creator_id", creatorId).maybeSingle();
  return data ? decryptToken(data.access_token_encrypted) : null;
}

export async function markConnectionProblem(creatorId: string, e: MetaError) {
  await createServiceClient()
    .from("instagram_accounts")
    .update({ status: e.tokenInvalid ? "expired" : e.permissionMissing ? "revoked" : "error", last_error: e.message })
    .eq("creator_id", creatorId);
}

export async function getInstagramMedia(creatorId: string) {
  const account = await getInstagramAccount(creatorId);
  const connected = account?.status === "connected";

  if (connected) {
    try {
      const token = await accessToken(creatorId);
      if (!token) throw new MetaError("No access token stored", 190);
      const media = await recentMedia(account.ig_user_id, token);
      return {
        handle: account.username,
        sample: false,
        media: media.map((m): InstagramMedia => ({
          id: m.id,
          type: m.media_product_type === "REELS" || m.media_type === "VIDEO" ? "Reel" : "Post",
          caption: m.caption?.slice(0, 200) ?? "",
          thumbnailUrl: m.thumbnail_url ?? (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM" ? m.media_url ?? null : null),
          permalink: m.permalink ?? null,
          postedAt: m.timestamp,
        })),
      };
    } catch (e) {
      console.error("instagram media fetch failed", e);
      if (e instanceof MetaError && (e.tokenInvalid || e.permissionMissing)) await markConnectionProblem(creatorId, e);
      return { handle: account.username, sample: false, media: [] as InstagramMedia[] };
    }
  }

  const sample = process.env.NODE_ENV !== "production";
  return { handle: null, sample, media: sample ? SAMPLE_MEDIA : ([] as InstagramMedia[]) };
}

// Removes the connection and token; campaigns and storefront are kept.
export async function disconnectInstagram(creatorId: string) {
  const svc = createServiceClient();
  const { data: account } = await svc.from("instagram_accounts").select("ig_user_id").eq("creator_id", creatorId).maybeSingle();
  if (!account) return;
  try {
    const token = await accessToken(creatorId);
    if (token) await unsubscribeInstagram(account.ig_user_id, token);
  } catch (e) {
    // Best effort: the token may already be revoked.
    console.error("unsubscribeInstagram failed", e);
  }
  await svc.from("instagram_accounts").delete().eq("creator_id", creatorId);
}

// Re-subscribes the account so DM replies (messages) arrive too. Accounts
// connected before Follow before DM existed only had comments subscribed.
export async function ensureMessagingSubscription(creatorId: string) {
  const { data: account } = await createServiceClient().from("instagram_accounts").select("ig_user_id, status").eq("creator_id", creatorId).maybeSingle();
  if (account?.status !== "connected") return;
  try {
    const token = await accessToken(creatorId);
    if (token) await subscribeInstagram(account.ig_user_id, token);
  } catch (e) {
    console.error("instagram resubscribe failed", e);
  }
}

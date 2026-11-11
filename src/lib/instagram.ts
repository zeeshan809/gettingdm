import "server-only";
import { createClient } from "./supabase/server";
import type { InstagramMedia } from "./campaigns";

// Placeholder posts so campaigns can be built and tested locally before the
// Meta app is connected. Never offered in production.
const SAMPLE_MEDIA: InstagramMedia[] = [
  { id: "sample_reel_1", type: "Reel", caption: "Sample Reel · 5 Python tricks nobody teaches you", thumbnailUrl: null, permalink: null, postedAt: "2026-11-02T10:00:00Z" },
  { id: "sample_reel_2", type: "Reel", caption: "Sample Reel · Excel shortcuts that save hours", thumbnailUrl: null, permalink: null, postedAt: "2026-10-28T10:00:00Z" },
  { id: "sample_post_3", type: "Post", caption: "Sample Post · SQL interview cheat sheet", thumbnailUrl: null, permalink: null, postedAt: "2026-10-21T10:00:00Z" },
  { id: "sample_reel_4", type: "Reel", caption: "Sample Reel · Power BI dashboard in 60 seconds", thumbnailUrl: null, permalink: null, postedAt: "2026-10-15T10:00:00Z" },
  { id: "sample_post_5", type: "Post", caption: "Sample Post · My desk setup for coding", thumbnailUrl: null, permalink: null, postedAt: "2026-10-09T10:00:00Z" },
  { id: "sample_reel_6", type: "Reel", caption: "Sample Reel · 3 ChatGPT prompts for analysts", thumbnailUrl: null, permalink: null, postedAt: "2026-10-03T10:00:00Z" },
];

export async function getInstagramMedia(creatorId: string) {
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("instagram_accounts")
    .select("username, status")
    .eq("creator_id", creatorId)
    .maybeSingle();

  const connected = account?.status === "connected";
  // Real media comes from the Graph API once the Meta integration is built.
  const sample = !connected && process.env.NODE_ENV !== "production";
  return {
    handle: connected ? account.username : null,
    sample,
    media: sample ? SAMPLE_MEDIA : ([] as InstagramMedia[]),
  };
}

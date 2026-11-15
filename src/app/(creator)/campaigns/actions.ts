"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";
import { getCurrentCreator } from "@/lib/auth";
import { normalizeKeyword, validateCampaign, type CampaignInput } from "@/lib/campaigns";
import { ensureMessagingSubscription, getInstagramMedia } from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/storefront";

type Result = { error: string } | { ok: true; id: string };

function dbErrorMessage(error: PostgrestError) {
  if (error.code === "23505") {
    if (error.message.includes("campaigns_one_active_any")) return "You already have a live \"Any post\" campaign. Pause it first.";
    if (error.message.includes("campaigns_one_active_next")) return "You already have a live \"Next post\" campaign. Pause it first.";
    return "Another active campaign is already watching this post. Pause it first or pick a different post.";
  }
  console.error("campaign write failed", error);
  return "Couldn't save the campaign. Please try again.";
}

function toRow(input: CampaignInput) {
  return {
    name: input.name.trim(),
    post_scope: input.postScope,
    exclude_keywords: [...new Set(input.excludeKeywords.map(normalizeKeyword).filter(Boolean))],
    public_reply_enabled: input.publicReplyEnabled,
    public_replies: input.publicReplies.map((r) => r.trim()).filter(Boolean),
    // "Any comment" campaigns ignore keywords entirely.
    keywords: input.matchRule === "any" ? [] : [...new Set(input.keywords.map(normalizeKeyword))],
    match_rule: input.matchRule,
    message: input.message.trim(),
    cta_label: input.cta.trim() || "Open the link",
    link_title: input.link.title.trim() || input.name.trim(),
    link_description: input.link.description.trim(),
    link_url: input.link.url.trim(),
    link_button_label: input.link.buttonLabel.trim() || "Open",
    link_active: input.link.active,
    active: input.active,
    delay_seconds: input.delaySeconds,
    follow_required: input.followRequired,
  };
}

const NO_MEDIA = {
  ig_media_id: null, media_type: null, media_caption: null, media_thumbnail_url: null, media_permalink: null, media_posted_at: null,
};

// Post details come from the creator's own media list, never from the client.
// "Any post" and "Next post" campaigns have no post yet.
async function mediaRow(creatorId: string, input: CampaignInput) {
  if (input.postScope !== "specific") return NO_MEDIA;
  const mediaId = input.mediaId;
  const { media } = await getInstagramMedia(creatorId);
  const m = media.find((x) => x.id === mediaId);
  return m && {
    ig_media_id: m.id,
    media_type: m.type,
    media_caption: m.caption,
    media_thumbnail_url: m.thumbnailUrl,
    media_permalink: m.permalink,
    media_posted_at: m.postedAt,
  };
}

export async function createCampaign(input: CampaignInput): Promise<Result> {
  const error = validateCampaign(input);
  if (error) return { error };
  const creator = await getCurrentCreator();
  const media = await mediaRow(creator.id, input);
  if (!media) return { error: "That post isn't available. Pick another one." };

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("campaigns")
    .insert({ ...toRow(input), ...media })
    .select("id")
    .single();
  if (dbError) return { error: dbErrorMessage(dbError) };

  if (input.followRequired) await ensureMessagingSubscription(creator.id);
  revalidatePath("/campaigns");
  return { ok: true, id: data.id };
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<Result> {
  if (!UUID_RE.test(id)) return { error: "Campaign not found." };
  const error = validateCampaign(input);
  if (error) return { error };
  const creator = await getCurrentCreator();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("campaigns").select("ig_media_id, post_scope").eq("id", id).maybeSingle();
  if (!existing) return { error: "Campaign not found." };

  // Keep stored post details when the post is unchanged (it may have dropped off the recent list).
  const unchanged = input.postScope === "specific" && existing.post_scope === "specific" && existing.ig_media_id === input.mediaId;
  const media = unchanged ? {} : await mediaRow(creator.id, input);
  if (!media) return { error: "That post isn't available. Pick another one." };

  const { error: dbError } = await supabase.from("campaigns").update({ ...toRow(input), ...media }).eq("id", id);
  if (dbError) return { error: dbErrorMessage(dbError) };

  if (input.followRequired) await ensureMessagingSubscription(creator.id);
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  return { ok: true, id };
}

export async function setCampaignActive(id: string, active: boolean): Promise<Result> {
  if (!UUID_RE.test(id)) return { error: "Campaign not found." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("campaigns").update({ active }).eq("id", id).select("id");
  if (error) return { error: dbErrorMessage(error) };
  if (!data.length) return { error: "Campaign not found." };

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  return { ok: true, id };
}

export async function deleteCampaign(id: string): Promise<Result> {
  if (!UUID_RE.test(id)) return { error: "Campaign not found." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("campaigns").delete().eq("id", id).select("id");
  if (error) return { error: dbErrorMessage(error) };
  if (!data.length) return { error: "Campaign not found." };

  revalidatePath("/campaigns");
  return { ok: true, id };
}

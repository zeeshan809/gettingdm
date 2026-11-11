"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";
import { getCurrentCreator } from "@/lib/auth";
import { normalizeKeyword, validateCampaign, type CampaignInput } from "@/lib/campaigns";
import { getInstagramMedia } from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/storefront";

type Result = { error: string } | { ok: true; id: string };

function dbErrorMessage(error: PostgrestError) {
  // Raised by the enforce_campaign_limit trigger, e.g. "Active campaign limit reached for your plan (5)".
  if (error.code === "P0001") return `${error.message}. Pause another campaign first, or upgrade to Creator Plus.`;
  if (error.code === "23505") return "Another active campaign is already watching this post. Pause it first or pick a different post.";
  console.error("campaign write failed", error);
  return "Couldn't save the campaign. Please try again.";
}

function toRow(input: CampaignInput) {
  return {
    name: input.name.trim(),
    keywords: [...new Set(input.keywords.map(normalizeKeyword))],
    match_rule: input.matchRule,
    message: input.message.trim(),
    cta_label: input.cta.trim() || "Open the link",
    link_title: input.link.title.trim(),
    link_description: input.link.description.trim(),
    link_url: input.link.url.trim(),
    link_button_label: input.link.buttonLabel.trim() || "Open",
    link_active: input.link.active,
    active: input.active,
  };
}

// Post details come from the creator's own media list, never from the client.
async function mediaRow(creatorId: string, mediaId: string) {
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
  const media = await mediaRow(creator.id, input.mediaId);
  if (!media) return { error: "That post isn't available. Pick another one." };

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("campaigns")
    .insert({ ...toRow(input), ...media })
    .select("id")
    .single();
  if (dbError) return { error: dbErrorMessage(dbError) };

  revalidatePath("/campaigns");
  return { ok: true, id: data.id };
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<Result> {
  if (!UUID_RE.test(id)) return { error: "Campaign not found." };
  const error = validateCampaign(input);
  if (error) return { error };
  const creator = await getCurrentCreator();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("campaigns").select("ig_media_id").eq("id", id).maybeSingle();
  if (!existing) return { error: "Campaign not found." };

  // Keep stored post details when the post is unchanged (it may have dropped off the recent list).
  const media = existing.ig_media_id === input.mediaId ? {} : await mediaRow(creator.id, input.mediaId);
  if (!media) return { error: "That post isn't available. Pick another one." };

  const { error: dbError } = await supabase.from("campaigns").update({ ...toRow(input), ...media }).eq("id", id);
  if (dbError) return { error: dbErrorMessage(dbError) };

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

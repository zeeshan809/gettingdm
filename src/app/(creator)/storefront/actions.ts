"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateStorefront, type StorefrontInput } from "@/lib/storefront";

export async function saveStorefront(input: StorefrontInput): Promise<{ error: string } | { ok: true }> {
  const error = validateStorefront(input);
  if (error) return { error };

  const { profile, featured, fallback } = input;
  const supabase = await createClient();
  const { error: dbError } = await supabase.rpc("save_storefront", {
    p_profile: {
      full_name: profile.name.trim(),
      username: profile.username,
      bio: profile.bio.trim(),
      theme: profile.theme,
      socials: profile.socials.map((s) => ({ platform: s.platform, url: s.url.trim() })),
    },
    // Empty slots are simply not stored.
    p_links: featured
      .filter((l) => l.title.trim() && l.url.trim())
      .map((l) => ({
        position: l.position,
        title: l.title.trim(),
        description: l.description.trim(),
        url: l.url.trim(),
        button_label: l.buttonLabel.trim() || "Open",
        active: l.active,
      })),
    p_default: fallback.title.trim() && fallback.url.trim()
      ? {
          title: fallback.title.trim(),
          description: fallback.description.trim(),
          url: fallback.url.trim(),
          button_label: fallback.buttonLabel.trim() || "Open",
          active: fallback.active,
        }
      : null,
  });

  if (dbError) {
    if (dbError.code === "23505") return { error: "That username is already taken." };
    console.error("save_storefront failed", dbError);
    return { error: "Couldn't save your storefront. Please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

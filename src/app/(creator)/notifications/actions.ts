"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/auth";
import { UUID_RE } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/server";

// RLS limits both updates to the creator's own notifications.
export async function markNotificationsRead(id?: string) {
  if (id && !UUID_RE.test(id)) return;
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("creator_id", creator.id).is("read_at", null);
  if (id) q = q.eq("id", id);
  await q;
  revalidatePath("/", "layout");
}

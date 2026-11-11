"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCreator } from "@/lib/auth";
import { EMAIL_PREF_KEYS, type EmailPrefs } from "@/lib/settings";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true };

export async function updateName(name: string): Promise<Result> {
  const clean = name.trim();
  if (!clean) return { error: "Enter your name." };
  if (clean.length > 80) return { error: "Name must be 80 characters or fewer." };
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: clean }).eq("id", creator.id);
  if (error) return { error: "Couldn't save your name. Please try again." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveEmailPrefs(prefs: EmailPrefs): Promise<Result> {
  // Only known keys, only booleans.
  const clean = Object.fromEntries(EMAIL_PREF_KEYS.map((k) => [k, prefs[k] === true]));
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ email_prefs: clean }).eq("id", creator.id);
  return error ? { error: "Couldn't save your preferences." } : { ok: true };
}

// Deletes the auth user; every creator table cascades from it.
// TODO(billing): cancel the Razorpay subscription first once billing exists.
export async function deleteAccount(confirmUsername: string): Promise<Result> {
  const creator = await getCurrentCreator();
  if (confirmUsername.trim().toLowerCase() !== creator.username) return { error: "The username doesn't match." };

  const { error } = await createServiceClient().auth.admin.deleteUser(creator.id);
  if (error) {
    console.error("account deletion failed", error);
    return { error: "Couldn't delete your account. Please contact support." };
  }
  await (await createClient()).auth.signOut().catch(() => {});
  redirect("/login?error=deleted");
}

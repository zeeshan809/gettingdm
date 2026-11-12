"use server";

import { revalidatePath } from "next/cache";
import { cancelSubscription, razorpayConfigured } from "@/lib/razorpay";
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
// Any Razorpay subscription is cancelled first so the creator is never charged again.
export async function deleteAccount(confirmUsername: string): Promise<Result> {
  const creator = await getCurrentCreator();
  if (confirmUsername.trim().toLowerCase() !== creator.username) return { error: "The username doesn't match." };

  const { data: sub } = await createServiceClient().from("subscriptions").select("razorpay_subscription_id").eq("creator_id", creator.id).maybeSingle();
  if (sub?.razorpay_subscription_id && razorpayConfigured()) {
    try {
      await cancelSubscription(sub.razorpay_subscription_id, false);
    } catch (e) {
      console.error("razorpay cancel on delete failed", e);
      return { error: "Couldn't cancel your subscription. Please try again or contact support." };
    }
  }

  const { error } = await createServiceClient().auth.admin.deleteUser(creator.id);
  if (error) {
    console.error("account deletion failed", error);
    return { error: "Couldn't delete your account. Please contact support." };
  }
  await (await createClient()).auth.signOut().catch(() => {});
  redirect("/login?error=deleted");
}

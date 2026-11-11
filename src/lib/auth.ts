import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

const ADMIN_ROLE_LABELS = {
  super_admin: "Super Admin",
  operations_admin: "Operations Admin",
  finance_admin: "Finance Admin",
  support_admin: "Support Admin",
} as const;

// Only allow same-site relative paths as post-login destinations.
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export const getCurrentCreator = cache(async () => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, email, status, onboarding_completed, subscriptions(plan, status, trial_end)")
    .eq("id", claims.claims.sub)
    .maybeSingle();

  if (!profile) {
    const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", claims.claims.sub).maybeSingle();
    redirect(admin ? "/admin" : "/auth/orphaned");
  }

  const sub = profile.subscriptions;
  const trialDaysLeft =
    sub?.status === "trial" && sub.trial_end
      ? Math.max(0, Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / 86_400_000))
      : null;

  return { ...profile, subscription: sub, trialDaysLeft };
});

// Admins must be in admin_users.
export const getCurrentAdmin = cache(async () => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id, role, name")
    .eq("user_id", claims.claims.sub)
    .maybeSingle();
  if (!admin) redirect("/admin/login");

  return { ...admin, email: claims.claims.email ?? "", roleLabel: ADMIN_ROLE_LABELS[admin.role] };
});

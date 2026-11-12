import { getCurrentCreator } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { BillingView } from "./billing-view";

export const metadata = { title: "Subscription" };

export default async function BillingPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const [{ data: sub }, { data: payments }, { count: activeCampaigns }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, trial_start, trial_end, current_period_end, cancel_at_period_end, razorpay_subscription_id")
      .eq("creator_id", creator.id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, created_at, plan, amount, status, method")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(24),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("creator_id", creator.id).eq("active", true),
  ]);

  return (
    <BillingView
      sub={sub ? {
        ...sub,
        // A live Razorpay mandate; after a cancellation the creator can subscribe again.
        hasMandate: !!sub.razorpay_subscription_id && ["trial", "active", "payment_pending", "past_due"].includes(sub.status),
      } : null}
      payments={payments ?? []}
      activeCampaigns={activeCampaigns ?? 0}
      paymentsReady={razorpayConfigured()}
    />
  );
}

import { PortalShell } from "@/components/portal-shell";
import { getCurrentCreator } from "@/lib/auth";
import { hasStorefront } from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  // Run both lookups together. RLS limits notifications to the signed-in creator.
  const supabase = await createClient();
  const [creator, { count }] = await Promise.all([
    getCurrentCreator(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
  ]);
  return (
    <PortalShell
      portal="creator"
      user={{
        name: creator.full_name || creator.username,
        subtitle: `@${creator.username}`,
        storefrontPath: hasStorefront(creator.subscription) ? `/${creator.username}` : undefined,
        storefrontLocked: !hasStorefront(creator.subscription),
        trialDaysLeft: creator.trialDaysLeft,
        unreadCount: count ?? 0,
      }}
    >
      {children}
    </PortalShell>
  );
}

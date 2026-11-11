import { PortalShell } from "@/components/portal-shell";
import { getCurrentCreator } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", creator.id)
    .is("read_at", null);
  return (
    <PortalShell
      portal="creator"
      user={{
        name: creator.full_name || creator.username,
        subtitle: `@${creator.username}`,
        storefrontPath: `/${creator.username}`,
        trialDaysLeft: creator.trialDaysLeft,
        unreadCount: count ?? 0,
      }}
    >
      {children}
    </PortalShell>
  );
}

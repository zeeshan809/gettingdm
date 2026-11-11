import { PortalShell } from "@/components/portal-shell";
import { getCurrentCreator } from "@/lib/auth";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const creator = await getCurrentCreator();
  return (
    <PortalShell
      portal="creator"
      user={{
        name: creator.full_name || creator.username,
        subtitle: `@${creator.username}`,
        storefrontPath: `/${creator.username}`,
        trialDaysLeft: creator.trialDaysLeft,
      }}
    >
      {children}
    </PortalShell>
  );
}

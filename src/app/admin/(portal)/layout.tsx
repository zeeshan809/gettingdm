import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-shell";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return (
    <PortalShell portal="admin" user={{ name: admin.name || admin.email, subtitle: admin.roleLabel }}>
      {children}
    </PortalShell>
  );
}

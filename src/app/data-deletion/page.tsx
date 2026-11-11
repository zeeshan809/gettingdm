import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Data Deletion", description: `How to delete your ${APP_NAME} data.` };

type Props = { searchParams: Promise<{ code?: string }> };

// Also the status page Meta links people to after a data-deletion callback (?code=…).
export default async function DataDeletionPage({ searchParams }: Props) {
  const { code } = await searchParams;
  let status: { status: string; completed_at: string | null } | null = null;
  if (code && /^[A-Z0-9]{12}$/.test(code)) {
    const { data } = await createServiceClient()
      .from("data_deletion_requests")
      .select("status, completed_at")
      .eq("confirmation_code", code)
      .maybeSingle();
    status = data;
  }

  return (
    <LegalPage title="Data Deletion">
      {code && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm">
          <p className="font-semibold text-violet-900">Deletion request {code}</p>
          <p className="mt-1 text-violet-800">
            {!status
              ? "We couldn't find a request with this code. Contact us if you need help."
              : status.status === "completed"
                ? "Completed. The Instagram data connected to this request has been deleted."
                : "Received. Deletion is in progress and usually finishes within minutes."}
          </p>
        </div>
      )}

      <p>You can delete your data from {APP_NAME} at any time, in any of these ways.</p>

      <h2>If you are a creator</h2>
      <h3>Delete your whole account</h3>
      <ol>
        <li>Log in and open <strong>Settings</strong>.</li>
        <li>Under <strong>Delete account</strong>, click <strong>Delete my account</strong> and type your username to confirm.</li>
      </ol>
      <p>
        This immediately and permanently deletes your account, storefront, campaigns, Instagram connection and access tokens,
        analytics, notifications and support tickets. Billing records we must keep for tax purposes are retained as required by law.
      </p>
      <h3>Disconnect only Instagram</h3>
      <ol>
        <li>Open <strong>Instagram</strong> in the {APP_NAME} dashboard and click <strong>Disconnect</strong>, or</li>
        <li>
          In Facebook, go to <strong>Settings &amp; privacy → Settings → Business integrations</strong> (or in Instagram,
          <strong> Settings → Website permissions → Apps and websites</strong>) and remove {APP_NAME}.
        </li>
      </ol>
      <p>
        Removing {APP_NAME} in Facebook or Instagram tells us automatically. We then delete your Instagram access token and
        connection data, and stop all automations.
      </p>

      <h2>If you commented on a creator&apos;s post</h2>
      <p>
        We only keep the comment details needed to send the creator&apos;s one-time reply, for up to 12 months. To have them
        deleted sooner, email us with your Instagram username.
      </p>

      <h2>Request deletion by email</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}?subject=Data%20deletion%20request`}>{SUPPORT_EMAIL}</a> from the address on your
        account, or include your Instagram username. We confirm and complete requests within 30 days.
      </p>

      <p>See our <Link href="/privacy">Privacy Policy</Link> for details on what we store.</p>
    </LegalPage>
  );
}

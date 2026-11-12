import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Data Deletion", description: `How to delete your ${APP_NAME} data, including data received from Instagram.` };

type Props = { searchParams: Promise<{ code?: string }> };

// Data deletion instructions (Meta "User data deletion" URL), and the status page Meta
// links people to after a data-deletion callback (?code=…).
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
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Data deletion request")}`;

  return (
    <LegalPage title="Data Deletion">
      {code && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm">
          <p className="font-semibold text-violet-900">Deletion request {code}</p>
          <p className="mt-1 text-violet-800">
            {!status
              ? "We couldn't find a request with this code. Please contact us if you need help."
              : status.status === "completed"
                ? `Completed${status.completed_at ? ` on ${new Date(status.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}` : ""}. The Instagram data connected to this request has been deleted.`
                : "Received. Deletion is in progress and usually finishes within minutes."}
          </p>
        </div>
      )}

      <p>
        You can ask {APP_NAME} to delete your data at any time, free of charge. This page explains how, for creators who use{" "}
        {APP_NAME}, for people who commented on a creator&apos;s post, and for storefront visitors.
      </p>

      <h2>If you are a creator</h2>

      <h3>Option 1: Delete your whole account</h3>
      <ol>
        <li>Log in to {APP_NAME} and open <strong>Settings</strong>.</li>
        <li>Under <strong>Delete account</strong>, click <strong>Delete my account</strong> and type your username to confirm.</li>
      </ol>
      <p>
        This immediately and permanently deletes your account, profile, storefront and images, campaigns, Instagram connection and
        access token, comment and message records, analytics, notifications and support tickets, and cancels your subscription.
      </p>

      <h3>Option 2: Remove {APP_NAME} from Instagram or Facebook</h3>
      <ol>
        <li>
          In the Instagram app, go to <strong>Settings and activity → Website permissions → Apps and websites</strong>, find{" "}
          {APP_NAME} and tap <strong>Remove</strong>; or
        </li>
        <li>
          On Facebook, go to <strong>Settings &amp; privacy → Settings → Business integrations</strong>, select {APP_NAME} and click{" "}
          <strong>Remove</strong>.
        </li>
      </ol>
      <p>
        Meta tells us automatically. We then delete your Instagram connection and access token, the comment and message records
        received through it, and the post details stored on your campaigns, and pause your campaigns. If Meta shows you a
        confirmation code, you can check the status of your request on this page.
      </p>

      <h3>Option 3: Disconnect Instagram only</h3>
      <p>
        Open <strong>Instagram</strong> in the {APP_NAME} dashboard and click <strong>Disconnect</strong>. This deletes your access
        token and stops all automations, while keeping your {APP_NAME} account so you can reconnect later.
      </p>

      <h2>If you commented on a creator&apos;s post or received a message</h2>
      <p>
        We keep only what is needed to send the creator&apos;s message and avoid duplicates: the comment, your Instagram username and
        app-specific ID, and the delivery status. We delete these automatically after 12 months. We do not store the text of
        messages you send in the conversation.
      </p>
      <p>
        To have your data deleted sooner, email <a href={mailto}>{SUPPORT_EMAIL}</a> with your Instagram username. We will
        delete every record about you within 30 days and confirm by email.
      </p>

      <h2>If you visited a storefront</h2>
      <p>
        We do not store your IP address or set cookies. Visits are counted with a code that changes daily and cannot identify you.
        These counts are deleted automatically after 24 months.
      </p>

      <h2>What we keep, and for how long</h2>
      <ul>
        <li>
          <strong>Payment records</strong> are kept by our payment provider, Razorpay, for as long as Indian law requires. Our own
          copy is deleted with your account.
        </li>
        <li>
          <strong>A record that a deletion request happened</strong> (a confirmation code and date, without the deleted data), so we
          can show its status and prove it was completed.
        </li>
        <li>
          <strong>Backups</strong>: deleted data may remain in encrypted database backups for up to 30 days before those backups are
          overwritten.
        </li>
      </ul>

      <h2>Request deletion by email</h2>
      <p>
        Email <a href={mailto}>{SUPPORT_EMAIL}</a> from the address on your {APP_NAME} account, or include your Instagram username.
        We may ask you to confirm the request comes from you. We complete requests within 30 days.
      </p>

      <p>See our <Link href="/privacy">Privacy Policy</Link> for full details on what we collect and why.</p>
    </LegalPage>
  );
}

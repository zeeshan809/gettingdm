import { Instagram, ShieldCheck } from "lucide-react";
import { buttonClass, Callout, Card, CardHeader, ConnectionBadge, PageHeader } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { date } from "@/lib/format";
import { getInstagramAccount } from "@/lib/instagram";
import { metaConfig } from "@/lib/meta";
import { DisconnectButton } from "./disconnect-button";

export const metadata = { title: "Instagram" };

type Status = "connected" | "expired" | "revoked" | "error" | "disconnected";

const statusHelp: Record<Status, string> = {
  connected: "Automations are running normally.",
  expired: "Your access has expired. Reconnect to resume automations.",
  revoked: "Permissions were removed in Facebook or Instagram settings. Reconnect and approve all permissions.",
  error: "We couldn't reach Instagram with your account. Try reconnecting.",
  disconnected: "Connect your account to start automating DMs.",
};

const errors: Record<string, [string, string]> = {
  cancelled: ["Connection cancelled", "You closed the Meta login before finishing. Try again whenever you're ready."],
  state: ["Connection expired", "The login took too long or was opened in another browser. Please try again."],
  no_instagram: [
    "No Instagram account found",
    "Your Instagram account must be a Business or Creator account linked to a Facebook Page, and you need to select that Page in Meta's login window.",
  ],
  already_connected: ["Already connected elsewhere", "That Instagram account is connected to a different GettingDM account. Disconnect it there first."],
  permissions: ["Permissions missing", "Please reconnect and allow every permission Meta asks for. GettingDM needs all of them to reply to comments."],
  not_configured: ["Instagram connection isn't available yet", "The Meta app isn't fully set up. Please try again later."],
  failed: ["Couldn't connect", "Something went wrong talking to Meta. Please try again in a minute."],
};

const permissions = [
  "Read your profile and posts",
  "Receive comment notifications",
  "Send private replies to comments",
];

export default async function InstagramPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  const { connected, error } = await searchParams;
  const creator = await getCurrentCreator();
  const account = await getInstagramAccount(creator.id);
  const status: Status = (account?.status as Status) ?? "disconnected";
  const configured = Boolean(metaConfig());
  const err = error ? errors[error] ?? errors.failed : null;

  return (
    <>
      <PageHeader title="Instagram connection" description="Connected through Meta's official login. We never see or store your password." />

      <div className="mb-6 space-y-3 empty:hidden">
        {connected && status === "connected" && <Callout tone="blue" title="Instagram connected">@{account?.username} is ready. Create a campaign to start replying to comments.</Callout>}
        {err && <Callout tone="red" title={err[0]}>{err[1]}</Callout>}
        {status !== "connected" && status !== "disconnected" && <Callout tone="red" title="Automations are paused">{statusHelp[status]}</Callout>}
        {!configured && !err && status === "disconnected" && (
          <Callout tone="yellow" title="Instagram connection is being set up">Connecting Instagram will be available shortly.</Callout>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Account" />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            {account?.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.profile_picture_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white">
                <Instagram className="h-7 w-7" />
              </span>
            )}
            <div className="flex-1">
              <p className="font-semibold">{account ? `@${account.username}` : "No account connected"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConnectionBadge status={status} />
                <span className="text-xs text-zinc-500">{statusHelp[status]}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {status !== "connected" && configured && (
                // Full page load on purpose: the route redirects off-site to Meta.
                // eslint-disable-next-line @next/next/no-html-link-for-pages
                <a href="/api/instagram/connect" className={buttonClass()}>{status === "disconnected" ? "Connect with Meta" : "Reconnect"}</a>
              )}
              {account && <DisconnectButton />}
            </div>
          </div>
          {account && (
            <dl className="grid grid-cols-2 gap-4 border-t border-zinc-100 p-5 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-zinc-500">Facebook Page</dt><dd className="font-medium">{account.page_name ?? "—"}</dd></div>
              <div><dt className="text-xs text-zinc-500">Connected on</dt><dd className="font-medium">{date(account.connected_at)}</dd></div>
              <div><dt className="text-xs text-zinc-500">Access</dt><dd className="font-medium">Doesn&apos;t expire</dd></div>
            </dl>
          )}
        </Card>

        <Card>
          <CardHeader title={status === "connected" ? "Permissions granted" : "Permissions we'll ask for"} />
          <ul className="space-y-2.5 p-5 text-sm">
            {permissions.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <ShieldCheck className={status === "connected" ? "mt-0.5 h-4 w-4 text-emerald-600" : "mt-0.5 h-4 w-4 text-zinc-300"} />
                {p}
              </li>
            ))}
          </ul>
          <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
            Needs an Instagram Business or Creator account linked to a Facebook Page. Instagram allows one private reply per comment, within 7 days.
          </p>
        </Card>
      </div>
    </>
  );
}

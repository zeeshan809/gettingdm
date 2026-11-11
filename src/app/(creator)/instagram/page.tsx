"use client";

import { useState } from "react";
import { Instagram, ShieldCheck } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Button, Callout, Card, CardHeader, ConnectionBadge, PageHeader } from "@/components/ui";
import { currentCreator, TODAY, type ConnectionStatus } from "@/lib/mock-data";
import { date, daysBetween } from "@/lib/format";

const statusHelp: Record<ConnectionStatus, string> = {
  connected: "Automations are running normally.",
  expired: "Your access has expired. Reconnect to resume automations.",
  revoked: "Permissions were removed in Instagram settings. Reconnect and approve all permissions.",
  error: "We couldn't reach Instagram with your account. Try reconnecting.",
  disconnected: "Connect your account to start automating DMs.",
};

const permissions = [
  "Read your profile and media",
  "Receive comment notifications (webhooks)",
  "Send private replies to comments",
  "Manage messages",
];

export default function InstagramPage() {
  const toast = useToast();
  const ig = currentCreator.instagram;
  const [status, setStatus] = useState<ConnectionStatus>(ig?.status ?? "disconnected");
  const [confirm, setConfirm] = useState(false);
  const tokenDays = ig ? daysBetween(TODAY, ig.tokenExpiresAt) : 0;

  return (
    <>
      <PageHeader title="Instagram connection" description="Connected through Meta's official login. We never see or store your password." />

      {status !== "connected" && status !== "disconnected" && (
        <div className="mb-6"><Callout tone="red" title="Automations are paused">{statusHelp[status]}</Callout></div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Account" />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white">
              <Instagram className="h-7 w-7" />
            </span>
            <div className="flex-1">
              {status === "disconnected" ? (
                <p className="font-semibold">No account connected</p>
              ) : (
                <p className="font-semibold">@{ig?.handle}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <ConnectionBadge status={status} />
                <span className="text-xs text-zinc-500">{statusHelp[status]}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {status === "connected" ? (
                <Button variant="danger-outline" onClick={() => setConfirm(true)}>Disconnect</Button>
              ) : (
                <Button onClick={() => { setStatus("connected"); toast("Instagram connected"); }}>{status === "disconnected" ? "Connect with Meta" : "Reconnect"}</Button>
              )}
            </div>
          </div>
          {status === "connected" && ig && (
            <dl className="grid grid-cols-2 gap-4 border-t border-zinc-100 p-5 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-zinc-500">Account type</dt><dd className="font-medium">Creator</dd></div>
              <div><dt className="text-xs text-zinc-500">Connected on</dt><dd className="font-medium">{date(ig.connectedAt)}</dd></div>
              <div>
                <dt className="text-xs text-zinc-500">Access renews</dt>
                <dd className="font-medium">{date(ig.tokenExpiresAt)} <span className="text-xs font-normal text-zinc-500">({tokenDays} days)</span></dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <CardHeader title="Permissions granted" />
          <ul className="space-y-2.5 p-5 text-sm">
            {permissions.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <ShieldCheck className={status === "connected" ? "mt-0.5 h-4 w-4 text-emerald-600" : "mt-0.5 h-4 w-4 text-zinc-300"} />
                {p}
              </li>
            ))}
          </ul>
          <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
            Instagram limits private replies to one per comment, within 7 days of the comment.
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-zinc-500">Preview other connection states (demo only)</p>
        <div className="flex flex-wrap gap-2">
          {(["connected", "expired", "revoked", "error", "disconnected"] as const).map((s) => (
            <Button key={s} size="sm" variant={s === status ? "primary" : "secondary"} onClick={() => setStatus(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Disconnect Instagram?"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setStatus("disconnected"); setConfirm(false); toast("Instagram disconnected"); }}>Disconnect</Button>
        </>}
      >
        All active campaigns will stop replying to comments until you reconnect. Your campaigns and storefront are kept.
      </Modal>
    </>
  );
}

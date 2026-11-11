"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, Bell, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, cn, EmptyState, PageHeader } from "@/components/ui";
import { dateTime } from "@/lib/format";
import { markNotificationsRead } from "./actions";

const icons = { info: Bell, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };
const colors = { info: "text-sky-600 bg-sky-50", success: "text-emerald-600 bg-emerald-50", warning: "text-amber-600 bg-amber-50", danger: "text-red-600 bg-red-50" };

type Item = { id: string; tone: string; title: string; body: string; link: string | null; read_at: string | null; created_at: string };

export function NotificationList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unread = items.filter((n) => !n.read_at).length;

  const open = (n: Item) =>
    startTransition(async () => {
      if (!n.read_at) await markNotificationsRead(n.id);
      // Only follow in-app links.
      if (n.link?.startsWith("/") && !n.link.startsWith("//")) router.push(n.link);
      else router.refresh();
    });

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : undefined}
        actions={unread > 0 && (
          <Button variant="secondary" size="sm" disabled={pending} onClick={() => startTransition(async () => { await markNotificationsRead(); router.refresh(); })}>
            Mark all as read
          </Button>
        )}
      />
      <Card>
        {items.length === 0 ? (
          <EmptyState title="No notifications yet" description="Updates about your campaigns, Instagram connection and billing will appear here." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {items.map((n) => {
              const tone = (n.tone in icons ? n.tone : "info") as keyof typeof icons;
              const Icon = icons[tone];
              return (
                <li key={n.id}>
                  <button type="button" onClick={() => open(n)} className={cn("flex w-full gap-3 px-5 py-4 text-left hover:bg-zinc-50", !n.read_at && "bg-violet-50/40")}>
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colors[tone])}><Icon className="h-4 w-4" /></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-sm text-zinc-600">{n.body}</p>}
                      <p className="mt-1 text-xs text-zinc-400">{dateTime(n.created_at)}</p>
                    </div>
                    {!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-600" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

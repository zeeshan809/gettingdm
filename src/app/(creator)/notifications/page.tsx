"use client";

import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, cn, PageHeader } from "@/components/ui";
import { notifications as initial } from "@/lib/mock-data";
import { dateTime } from "@/lib/format";

const icons = { info: Bell, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };
const colors = { info: "text-sky-600 bg-sky-50", success: "text-emerald-600 bg-emerald-50", warning: "text-amber-600 bg-amber-50", danger: "text-red-600 bg-red-50" };

export default function NotificationsPage() {
  const [items, setItems] = useState(initial);
  return (
    <>
      <PageHeader
        title="Notifications"
        actions={<Button variant="secondary" size="sm" onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}>Mark all as read</Button>}
      />
      <Card>
        <ul className="divide-y divide-zinc-100">
          {items.map((n) => {
            const Icon = icons[n.tone];
            return (
              <li key={n.id} className={cn("flex gap-3 px-5 py-4", !n.read && "bg-violet-50/40")}>
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colors[n.tone])}><Icon className="h-4 w-4" /></span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-zinc-600">{n.body}</p>
                  <p className="mt-1 text-xs text-zinc-400">{dateTime(n.at)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-600" aria-label="Unread" />}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

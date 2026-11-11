import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, cn, PageHeader, TicketBadge } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { dateTime } from "@/lib/format";
import { UUID_RE } from "@/lib/storefront";
import { categoryLabel, ticketRef } from "@/lib/support";
import { createClient } from "@/lib/supabase/server";
import { ReplyForm } from "./reply-form";

export const metadata = { title: "Support ticket" };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const creator = await getCurrentCreator();
  const supabase = await createClient();

  const [{ data: ticket }, { data: messages }] = await Promise.all([
    supabase.from("support_tickets").select("id, subject, category, status, created_at").eq("id", id).eq("creator_id", creator.id).maybeSingle(),
    supabase.from("ticket_messages").select("id, body, from_admin, created_at").eq("ticket_id", id).order("created_at"),
  ]);
  if (!ticket) notFound();
  const closed = ticket.status === "closed";

  return (
    <>
      <Link href="/support" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Support
      </Link>
      <PageHeader
        title={ticket.subject}
        description={`${ticketRef(ticket.id)} · ${categoryLabel(ticket.category)} · Opened ${dateTime(ticket.created_at)}`}
        actions={<TicketBadge status={ticket.status} creatorView />}
      />

      <div className="max-w-3xl space-y-3">
        {(messages ?? []).map((m) => (
          <Card key={m.id} className={cn("p-4", m.from_admin ? "border-violet-200 bg-violet-50/50" : "")}>
            <p className="mb-1 text-xs font-medium text-zinc-500">
              {m.from_admin ? "GettingDM support" : "You"} · {dateTime(m.created_at)}
            </p>
            <p className="whitespace-pre-line text-sm text-zinc-800">{m.body}</p>
          </Card>
        ))}

        {closed ? (
          <p className="pt-2 text-sm text-zinc-500">This ticket is closed. Open a new ticket if you need more help.</p>
        ) : (
          <ReplyForm ticketId={ticket.id} />
        )}
      </div>
    </>
  );
}

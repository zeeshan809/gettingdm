import Link from "next/link";
import { Card, CardHeader, EmptyState, PageHeader, Table, Td, Th, TicketBadge } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { date } from "@/lib/format";
import { categoryLabel, ticketRef } from "@/lib/support";
import { createClient } from "@/lib/supabase/server";
import { NewTicketButton } from "./new-ticket";

export const metadata = { title: "Support" };

const faqs = [
  { q: "Why didn't someone get a DM?", a: "Instagram only allows one private reply per comment, within 7 days. Comments that don't match your keyword rule, or repeat commenters, are skipped." },
  { q: "Can I change my featured links without editing campaigns?", a: "Yes. Featured links are global — edit them on the Storefront page and every campaign uses the new version." },
  { q: "How many campaigns can I run?", a: "Up to 5 active campaigns on Creator and 50 on Creator Plus. Paused campaigns don't count." },
];

export default async function SupportPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, updated_at")
    .eq("creator_id", creator.id)
    .order("updated_at", { ascending: false });

  const plus = creator.subscription?.plan === "creator_plus";

  return (
    <>
      <PageHeader
        title="Support"
        description={plus ? "Creator Plus: priority support." : "We reply within 24 hours. Creator Plus gets priority."}
        actions={<NewTicketButton />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your tickets" />
          {!tickets?.length ? (
            <EmptyState title="No tickets yet" description="Stuck on something? Open a ticket and we'll get back to you." />
          ) : (
            <Table>
              <thead><tr><Th>Ticket</Th><Th>Subject</Th><Th>Status</Th><Th>Updated</Th></tr></thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50">
                    <Td className="font-mono text-xs">{ticketRef(t.id)}</Td>
                    <Td>
                      <Link href={`/support/${t.id}`} className="font-medium text-zinc-900 hover:text-violet-700">{t.subject}</Link>
                      <span className="block text-xs text-zinc-400">{categoryLabel(t.category)}</span>
                    </Td>
                    <Td><TicketBadge status={t.status} creatorView /></Td>
                    <Td>{date(t.updated_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <Card>
          <CardHeader title="Common questions" />
          <div className="divide-y divide-zinc-100">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 py-3">
                <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-zinc-600">{f.a}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

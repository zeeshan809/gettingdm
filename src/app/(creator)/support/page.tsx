"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, Table, Td, Textarea, Th, TicketBadge } from "@/components/ui";
import { creatorTickets } from "@/lib/mock-data";
import { date } from "@/lib/format";

const faqs = [
  { q: "Why didn't someone get a DM?", a: "Instagram only allows one private reply per comment, within 7 days. Comments that don't match your keyword rule, or repeat commenters, are skipped." },
  { q: "Can I change my featured links without editing campaigns?", a: "Yes. Featured links are global — edit them on the Storefront page and every campaign uses the new version." },
  { q: "How do I cancel my subscription?", a: "Go to Subscription and choose Cancel plan. You keep access until the end of the billing period." },
];

export default function SupportPage() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Support" description="Standard plan replies within 24 hours. Creator Plus gets priority." actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New ticket</Button>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your tickets" />
          <Table>
            <thead><tr><Th>Ticket</Th><Th>Subject</Th><Th>Status</Th><Th>Updated</Th></tr></thead>
            <tbody>
              {creatorTickets.map((t) => (
                <tr key={t.id}>
                  <Td className="font-mono text-xs">{t.id}</Td>
                  <Td className="font-medium">{t.subject}</Td>
                  <Td><TicketBadge status={t.status} /></Td>
                  <Td>{date(t.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New support ticket"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); toast("Ticket submitted"); }}>Submit</Button>
        </>}
      >
        <div className="space-y-3">
          <Field label="Topic">
            <Select>
              <option>Automation / DMs</option>
              <option>Instagram connection</option>
              <option>Storefront</option>
              <option>Billing</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Subject"><Input /></Field>
          <Field label="Details"><Textarea rows={4} /></Field>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Button, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { MESSAGE_MAX, SUBJECT_MAX, TICKET_CATEGORIES } from "@/lib/support";
import { createTicket } from "./actions";

export function NewTicketButton() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const r = await createTicket({
        subject: String(form.get("subject")),
        category: String(form.get("category")),
        body: String(form.get("body")),
      });
      if ("error" in r) return setError(r.error);
      setOpen(false);
      toast("Ticket submitted");
      router.push(`/support/${r.id}`);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New ticket</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New support ticket"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="new-ticket" disabled={pending}>{pending ? "Submitting…" : "Submit"}</Button>
        </>}
      >
        <form id="new-ticket" className="space-y-3" onSubmit={submit}>
          <FormError>{error}</FormError>
          <Field label="Topic">
            <Select name="category" defaultValue="automation">
              {TICKET_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Subject"><Input name="subject" required maxLength={SUBJECT_MAX} /></Field>
          <Field label="Details"><Textarea name="body" rows={5} required maxLength={MESSAGE_MAX} placeholder="What happened, and which campaign or link is it about?" /></Field>
        </form>
      </Modal>
    </>
  );
}

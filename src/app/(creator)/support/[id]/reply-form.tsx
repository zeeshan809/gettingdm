"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Card, FormError, Textarea } from "@/components/ui";
import { MESSAGE_MAX } from "@/lib/support";
import { replyToTicket } from "../actions";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const r = await replyToTicket(ticketId, text);
      if ("error" in r) return setError(r.error);
      setText("");
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <form className="space-y-3" onSubmit={send}>
        <FormError>{error}</FormError>
        <Textarea rows={4} required maxLength={MESSAGE_MAX} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a reply…" />
        <Button type="submit" disabled={pending || !text.trim()}>{pending ? "Sending…" : "Send reply"}</Button>
      </form>
    </Card>
  );
}

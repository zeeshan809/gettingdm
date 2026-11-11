"use server";

import { revalidatePath } from "next/cache";
import { MESSAGE_MAX, SUBJECT_MAX, TICKET_CATEGORIES } from "@/lib/support";
import { UUID_RE } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/server";

export async function createTicket(input: { subject: string; category: string; body: string }): Promise<{ error: string } | { id: string }> {
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject) return { error: "Add a subject." };
  if (subject.length > SUBJECT_MAX) return { error: `Subject must be ${SUBJECT_MAX} characters or fewer.` };
  if (!TICKET_CATEGORIES.some((c) => c.id === input.category)) return { error: "Pick a topic." };
  if (!body) return { error: "Describe the problem." };
  if (body.length > MESSAGE_MAX) return { error: `Details must be ${MESSAGE_MAX} characters or fewer.` };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_support_ticket", { p_subject: subject, p_category: input.category, p_body: body });
  if (error || !data) {
    console.error("create ticket failed", error);
    return { error: "Couldn't submit your ticket. Please try again." };
  }
  revalidatePath("/support");
  return { id: data };
}

export async function replyToTicket(ticketId: string, text: string): Promise<{ error: string } | { ok: true }> {
  if (!UUID_RE.test(ticketId)) return { error: "Ticket not found." };
  const body = text.trim();
  if (!body) return { error: "Write a message." };
  if (body.length > MESSAGE_MAX) return { error: `Message must be ${MESSAGE_MAX} characters or fewer.` };

  // RLS only allows replies to the creator's own tickets.
  const supabase = await createClient();
  const { error } = await supabase.from("ticket_messages").insert({ ticket_id: ticketId, body });
  if (error) return { error: "Couldn't send your reply. Please try again." };
  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/support");
  return { ok: true };
}

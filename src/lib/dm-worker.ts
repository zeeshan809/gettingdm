import "server-only";
import { matchKeyword, type MatchRule } from "./keywords";
import { accessToken, markConnectionProblem } from "./instagram";
import {
  conversationMessages, followsAccount, MetaError, metaTime, recentConversations, sendLinkButton, sendMessage, sendPrivateReply, type QuickReply,
} from "./meta";
import { dmLinkFor, hasStorefront } from "./plan";
import { createServiceClient } from "./supabase/server";

// Comment-to-DM worker.
// 1. A comment webhook arrives -> find the live campaign on that post -> match the keyword.
// 2. Send the DM right away, or queue it when the campaign has a delay.
// 3. Follow before DM: the first DM asks for a reply; when the person replies we check
//    they follow the creator, then send the link (or ask them to follow first).
// Every send first "claims" the row (status -> processing), so a DM is never sent twice
// even if the webhook and the minute worker run at the same time.

type CommentValue = { id?: string; text?: string; from?: { id?: string; username?: string }; media?: { id?: string }; parent_id?: string };
type MessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: { text?: string; is_echo?: boolean; quick_reply?: { payload?: string } };
  postback?: { payload?: string };
};
// standby: messages Meta routes to us while another app is the primary receiver for the account.
type MetaPayload = { entry?: { id: string; changes?: { field: string; value: CommentValue }[]; messaging?: MessagingEvent[]; standby?: MessagingEvent[] }[] };

const MAX_ATTEMPTS = 4;
const MAX_FOLLOW_PROMPTS = 5;
const REPLY_WINDOW_MS = 7 * 86_400_000; // Instagram allows a private reply within 7 days
const LINK_PAYLOAD = "GDM_LINK:";
const FOLLOWED_LABEL = "I've followed ✅";
const LIVE_PLAN = ["trial", "active", "payment_pending", "past_due"];

const svc = () => createServiceClient();
const nowIso = () => new Date().toISOString();

// ---------- entry points ----------

// receivedAt: when the webhook arrived. Comments that arrived before a campaign
// existed never get a DM (so a new campaign doesn't message an old backlog).
export async function processMetaPayload(eventId: string, payload: MetaPayload, receivedAt: string = nowIso()) {
  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === "comments" && change.value) await handleComment(entry.id, change.value, receivedAt);
      }
      for (const m of [...(entry.messaging ?? []), ...(entry.standby ?? [])]) await handleMessage(entry.id, m);
    }
    await svc().from("webhook_events").update({ processed_at: nowIso(), error: null }).eq("id", eventId);
  } catch (e) {
    console.error("meta event processing failed", e);
    await svc().from("webhook_events").update({ error: e instanceof Error ? e.message.slice(0, 500) : "Processing failed" }).eq("id", eventId);
  }
}

// Called every minute: delayed DMs, retries, and webhooks that weren't processed in time.
export async function runDueWork({ followOnly = false }: { followOnly?: boolean } = {}) {
  // Fast schedule (every 10s, only while someone is mid follow-gate): just look for taps.
  if (followOnly) return { delivered: 0, recovered: 0, followReplies: await pollFollowGates() };
  const db = svc();
  const { data: due } = await db
    .from("comment_events")
    .select("id")
    .eq("status", "queued")
    .lte("next_attempt_at", nowIso())
    .order("next_attempt_at")
    .limit(25);
  for (const row of due ?? []) await deliver(row.id);

  const stale = new Date(Date.now() - 2 * 60_000).toISOString();
  const { data: missed } = await db
    .from("webhook_events")
    .select("id, payload, received_at")
    .eq("provider", "meta")
    .is("processed_at", null)
    .is("error", null)
    .lte("received_at", stale)
    .limit(25);
  for (const ev of missed ?? []) await processMetaPayload(ev.id, ev.payload as MetaPayload, ev.received_at);

  const followReplies = await pollFollowGates();

  return { delivered: due?.length ?? 0, recovered: missed?.length ?? 0, followReplies };
}

// ---------- context ----------

async function accountFor(igUserId: string) {
  const { data } = await svc()
    .from("instagram_accounts")
    .select("creator_id, ig_user_id, username, status, profiles (username, subscriptions (plan, status))")
    .eq("ig_user_id", igUserId)
    .maybeSingle();
  if (!data || data.status !== "connected" || !data.profiles) return null;
  return {
    creatorId: data.creator_id,
    igUserId: data.ig_user_id,
    handle: data.username,
    username: data.profiles.username,
    sub: data.profiles.subscriptions,
  };
}

const personalize = (text: string, username: string | null) =>
  text.replaceAll("{first_name}", username ?? "there").replaceAll("{username}", username ? `@${username}` : "there");

async function setStatus(id: string, patch: Record<string, unknown>) {
  await svc().from("comment_events").update(patch as never).eq("id", id);
}

// Atomically take a row so only one worker sends it.
async function claim(id: string, from: string[]) {
  const { data } = await svc().from("comment_events").update({ status: "processing" }).eq("id", id).in("status", from as never).select("id");
  return (data?.length ?? 0) > 0;
}

// ---------- comments ----------

async function handleComment(igUserId: string, v: CommentValue, receivedAt: string) {
  if (!v.id || !v.media?.id || !v.from?.id) return;
  if (v.from.id === igUserId) return; // the creator's own comments and replies

  const account = await accountFor(igUserId);
  if (!account) return;

  const db = svc();
  const { data: campaign } = await db
    .from("campaigns")
    .select("id, keywords, match_rule, delay_seconds, created_at")
    .eq("creator_id", account.creatorId)
    .eq("ig_media_id", v.media.id)
    .eq("active", true)
    .maybeSingle();
  if (!campaign) return;
  if (new Date(receivedAt) < new Date(campaign.created_at)) return; // comment is older than the campaign

  const { data: row, error } = await db
    .from("comment_events")
    .insert({
      creator_id: account.creatorId,
      campaign_id: campaign.id,
      ig_comment_id: v.id,
      ig_media_id: v.media.id,
      commenter_ig_id: v.from.id,
      commenter_username: v.from.username ?? null,
      comment_text: (v.text ?? "").slice(0, 1000),
      status: "processing",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code !== "23505") console.error("comment_events insert failed", error); // 23505: webhook redelivery
    return;
  }

  const matched = matchKeyword(v.text ?? "", campaign.keywords, campaign.match_rule as MatchRule);
  if (!matched) return setStatus(row.id, { status: "ineligible", processed_at: nowIso() });

  if (!account.sub || !LIVE_PLAN.includes(account.sub.status)) {
    return setStatus(row.id, { status: "skipped", matched_keyword: matched, error: "Plan inactive", processed_at: nowIso() });
  }

  // One DM per person per campaign.
  let dup = db
    .from("comment_events")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaign.id)
    .in("status", ["sent", "awaiting_follow", "queued", "eligible"])
    .neq("id", row.id);
  dup = v.from.username ? dup.eq("commenter_username", v.from.username) : dup.eq("commenter_ig_id", v.from.id);
  const { count } = await dup;
  if (count) return setStatus(row.id, { status: "skipped", matched_keyword: matched, error: "Already sent to this person", processed_at: nowIso() });

  if (campaign.delay_seconds > 0) {
    return setStatus(row.id, {
      status: "queued",
      matched_keyword: matched,
      next_attempt_at: new Date(Date.now() + campaign.delay_seconds * 1000).toISOString(),
    });
  }
  await setStatus(row.id, { status: "eligible", matched_keyword: matched });
  await deliver(row.id);
}

// Sends the first DM (private reply) for a queued or eligible comment.
export async function deliver(eventId: string) {
  if (!(await claim(eventId, ["queued", "eligible"]))) return;
  const db = svc();
  const { data: ev } = await db
    .from("comment_events")
    .select("id, creator_id, campaign_id, ig_comment_id, commenter_ig_id, commenter_username, received_at, attempts, campaigns (message, cta_label, follow_required, active)")
    .eq("id", eventId)
    .single();
  if (!ev || !ev.campaigns) return setStatus(eventId, { status: "skipped", error: "Campaign deleted", processed_at: nowIso() });
  if (!ev.campaigns.active) return setStatus(eventId, { status: "skipped", error: "Campaign paused", processed_at: nowIso() });
  if (Date.now() - new Date(ev.received_at).getTime() > REPLY_WINDOW_MS) {
    return setStatus(eventId, { status: "failed", error: "Comment is older than 7 days", processed_at: nowIso() });
  }

  const { data: acc } = await db.from("instagram_accounts").select("ig_user_id").eq("creator_id", ev.creator_id).maybeSingle();
  const account = acc ? await accountFor(acc.ig_user_id) : null;
  const token = account ? await accessToken(ev.creator_id) : null;
  if (!account || !token) return setStatus(eventId, { status: "failed", error: "Instagram not connected", processed_at: nowIso() });

  const c = ev.campaigns;
  const text = personalize(c.message, ev.commenter_username);
  const cta = c.cta_label || "Get it here";

  try {
    const link = dmLinkFor({ username: account.username, campaignId: ev.campaign_id!, storefront: hasStorefront(account.sub) });
    // Follow before DM: Instagram often won't say whether someone follows until they've
    // interacted with the DM, so null means "unknown" and they get a tap-to-unlock prompt.
    const follows = c.follow_required ? await followStatus(ev.commenter_ig_id, token) : true;
    if (follows) {
      const res = await linkMessage(account.igUserId, token, { comment_id: ev.ig_comment_id }, text, cta, link);
      await setStatus(eventId, { status: "sent", commenter_ig_id: res.recipient_id, sent_at: nowIso(), error: null, processed_at: nowIso() });
    } else {
      const prompt = follows === false
        ? `${text}\n\nFollow @${account.handle} first, then tap "${FOLLOWED_LABEL}" below and I'll send your link 👇`
        : `${text}\n\nTap below to get your link 👇`;
      const button = follows === false ? FOLLOWED_LABEL : cta;
      const res = await privateReplyWithFallback(account.igUserId, token, ev.ig_comment_id, prompt, [{ title: button, payload: `${LINK_PAYLOAD}${ev.id}` }]);
      await setStatus(eventId, { status: "awaiting_follow", commenter_ig_id: res.recipient_id, attempts: 0, error: null, processed_at: nowIso() });
    }
  } catch (e) {
    await handleSendError(eventId, ev.creator_id, ev.attempts, e);
  }
}

// The link goes out as a tappable button. If Instagram won't take a button here,
// send the same message with the link written out, so the person still gets it.
async function linkMessage(igUserId: string, token: string, to: { comment_id: string } | { id: string }, text: string, cta: string, link: string) {
  try {
    return await sendLinkButton(igUserId, token, to, text, { title: cta, url: link });
  } catch (e) {
    if (!(e instanceof MetaError) || e.tokenInvalid || e.permissionMissing) throw e;
    console.error("link button rejected, sending text link", e.message);
    const body = `${text}\n\n${cta}: ${link}`;
    return "comment_id" in to ? sendPrivateReply(igUserId, token, to.comment_id, body) : sendMessage(igUserId, token, to.id, body);
  }
}

// Quick replies make "reply to get the link" one tap. If Instagram rejects them on a
// private reply, send the same text without the button.
async function privateReplyWithFallback(igUserId: string, token: string, commentId: string, text: string, qr: QuickReply[]) {
  try {
    return await sendPrivateReply(igUserId, token, commentId, text, qr);
  } catch (e) {
    if (e instanceof MetaError && e.code === 100) return sendPrivateReply(igUserId, token, commentId, text);
    throw e;
  }
}

// Meta request-limit errors (app, user, page/account level).
const isRateLimited = (e: unknown) => e instanceof MetaError && [4, 17, 32, 613].includes(e.code ?? 0);

// Errors that won't go away on retry, with a message the creator can act on.
const isPermanent = (e: unknown) => e instanceof MetaError && (e.code === 100 || e.code === 10 || e.code === 551);
function errorText(e: unknown) {
  const raw = e instanceof Error ? e.message : "Send failed";
  if (/thread owner/i.test(raw)) return "Another DM automation app is handling this conversation. Turn off other Instagram DM tools on this account.";
  return raw.slice(0, 500);
}

async function handleSendError(eventId: string, creatorId: string, attempts: number, e: unknown) {
  const message = errorText(e);
  if (e instanceof MetaError && (e.tokenInvalid || e.permissionMissing)) {
    await markConnectionProblem(creatorId, e);
    return setStatus(eventId, { status: "failed", error: message, processed_at: nowIso() });
  }
  // 10900-ish / 551 / "already replied" style errors won't succeed on retry either.
  const permanent = isPermanent(e);
  const next = attempts + 1;
  if (permanent || next >= MAX_ATTEMPTS) {
    return setStatus(eventId, { status: "failed", attempts: next, error: message, processed_at: nowIso() });
  }
  const backoffMin = [1, 5, 15][next - 1] ?? 15;
  await setStatus(eventId, { status: "queued", attempts: next, error: message, next_attempt_at: new Date(Date.now() + backoffMin * 60_000).toISOString() });
}

// ---------- replies (Follow before DM) ----------

// true / false when Instagram says, null when it won't (no consent yet) or the check fails.
async function followStatus(igsid: string | null, token: string): Promise<boolean | null> {
  if (!igsid) return null;
  try {
    return await followsAccount(igsid, token);
  } catch {
    return null;
  }
}

type GateRow = { id: string; campaign_id: string | null; attempts: number; campaigns: { cta_label: string | null; active: boolean } | null };
type Account = NonNullable<Awaited<ReturnType<typeof accountFor>>>;

// The person tapped the button or replied. The row is already claimed (status processing).
// Following -> send the link button. Not following -> ask again, up to MAX_FOLLOW_PROMPTS.
async function resolveFollowGate(ev: GateRow, account: Account, token: string, sender: string) {
  try {
    const follows = await followStatus(sender, token);
    // If Instagram still won't say, don't trap the person: send the link.
    if (follows !== false) {
      const link = dmLinkFor({ username: account.username, campaignId: ev.campaign_id!, storefront: hasStorefront(account.sub) });
      await linkMessage(account.igUserId, token, { id: sender }, "Thanks for following! 🙌 Here's your link:", ev.campaigns?.cta_label || "Get it here", link);
      return setStatus(ev.id, { status: "sent", sent_at: nowIso(), error: null, processed_at: nowIso() });
    }

    const prompts = ev.attempts + 1;
    if (prompts > MAX_FOLLOW_PROMPTS) {
      return setStatus(ev.id, { status: "skipped", attempts: prompts, error: "Didn't follow", processed_at: nowIso() });
    }
    await sendMessage(
      account.igUserId,
      token,
      sender,
      `You're not following @${account.handle} yet 🙏\n\nFollow first, then tap "${FOLLOWED_LABEL}" below and I'll send your link right away.`,
      [{ title: FOLLOWED_LABEL, payload: `${LINK_PAYLOAD}${ev.id}` }],
    );
    // processed_at marks the last prompt; only replies after it count as a new tap.
    await setStatus(ev.id, { status: "awaiting_follow", attempts: prompts, error: null, processed_at: nowIso() });
  } catch (e) {
    console.error("follow-gate reply failed", e);
    if (e instanceof MetaError && (e.tokenInvalid || e.permissionMissing)) await markConnectionProblem(account.creatorId, e);
    // Permanent (e.g. another app owns the thread): stop. Otherwise the next tap or poll retries.
    await setStatus(
      ev.id,
      isPermanent(e) ? { status: "failed", error: errorText(e), processed_at: nowIso() } : { status: "awaiting_follow", error: errorText(e) },
    );
  }
}

// Webhook path: Meta tells us about the reply directly.
async function handleMessage(igUserId: string, m: MessagingEvent) {
  const sender = m.sender?.id;
  if (!sender || sender === igUserId || m.message?.is_echo) return;
  if (!m.message && !m.postback) return;

  const account = await accountFor(igUserId);
  if (!account) return;

  // The tapped button names the exact comment; any other reply uses the latest open one.
  const payload = m.message?.quick_reply?.payload ?? m.postback?.payload ?? "";
  let query = svc()
    .from("comment_events")
    .select("id, campaign_id, attempts, campaigns (cta_label, active)")
    .eq("creator_id", account.creatorId)
    .eq("status", "awaiting_follow");
  query = payload.startsWith(LINK_PAYLOAD) ? query.eq("id", payload.slice(LINK_PAYLOAD.length)) : query.eq("commenter_ig_id", sender);
  const { data: ev } = await query.order("received_at", { ascending: false }).limit(1).maybeSingle();
  if (!ev) return;
  if (!(await claim(ev.id, ["awaiting_follow"]))) return;

  const token = await accessToken(account.creatorId);
  if (!token) return setStatus(ev.id, { status: "awaiting_follow" });
  await resolveFollowGate(ev, account, token, sender);
}

// Polling path (every minute): read DM threads for people waiting on Follow before DM,
// since Meta doesn't send message webhooks for every account.
async function pollFollowGates() {
  const db = svc();
  const { data: rows } = await db
    .from("comment_events")
    .select("id, creator_id, campaign_id, commenter_ig_id, attempts, processed_at, campaigns (cta_label, active)")
    .eq("status", "awaiting_follow")
    .gte("received_at", new Date(Date.now() - REPLY_WINDOW_MS).toISOString())
    .not("commenter_ig_id", "is", null)
    .limit(200);
  if (!rows?.length) return 0;

  let handled = 0;
  const byCreator = new Map<string, typeof rows>();
  for (const r of rows) byCreator.set(r.creator_id, [...(byCreator.get(r.creator_id) ?? []), r]);
  for (const [creatorId, waiting] of byCreator) {
    try {
      const { data: acc } = await db.from("instagram_accounts").select("ig_user_id").eq("creator_id", creatorId).maybeSingle();
      const account = acc ? await accountFor(acc.ig_user_id) : null;
      const token = account ? await accessToken(creatorId) : null;
      if (!account || !token) continue;

      const threads = await recentConversations(account.igUserId, token);
      for (const row of waiting) {
        const thread = threads.get(row.commenter_ig_id!);
        const lastPrompt = new Date(row.processed_at ?? 0).getTime();
        if (!thread || thread.updated <= lastPrompt) continue;
        const messages = await conversationMessages(thread.id, token);
        const replied = messages.some((m) => m.from?.id === row.commenter_ig_id && metaTime(m.created_time) > lastPrompt);
        if (!replied) {
          // The thread changed but not by them (e.g. another app messaged). Remember we've
          // read up to here so we don't re-read it every minute; later replies still count.
          await db.from("comment_events").update({ processed_at: new Date(thread.updated).toISOString() }).eq("id", row.id).eq("status", "awaiting_follow");
          continue;
        }
        if (!(await claim(row.id, ["awaiting_follow"]))) continue;
        await resolveFollowGate(row, account, token, row.commenter_ig_id!);
        handled++;
      }
    } catch (e) {
      console.error("follow-gate polling failed", e);
      if (e instanceof MetaError && (e.tokenInvalid || e.permissionMissing)) await markConnectionProblem(creatorId, e);
      // Meta's request limit: stop this run; the next minute tries again.
      if (isRateLimited(e)) break;
    }
  }
  return handled;
}

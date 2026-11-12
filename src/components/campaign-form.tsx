"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Info, X } from "lucide-react";
import { createCampaign, updateCampaign } from "@/app/(creator)/campaigns/actions";
import { APP_DOMAIN } from "@/lib/config";
import {
  CTA_MAX, KEYWORD_MAX_LENGTH, KEYWORDS_MAX, MESSAGE_MAX, normalizeKeyword,
  type CampaignInput, type InstagramMedia,
} from "@/lib/campaigns";
import { MATCH_RULES, matchKeyword } from "@/lib/keywords";
import { date } from "@/lib/format";
import { Toggle, useToast } from "./interactive";
import { Badge, Button, Callout, Card, CardHeader, cn, Field, FormError, Input, LinkButton, MediaThumb, Select, Textarea } from "./ui";

const blank = (mediaId: string): CampaignInput => ({
  name: "",
  mediaId,
  keywords: [],
  matchRule: "contains",
  message: "Hey {first_name}! Thanks for commenting 🙌 Here's what you asked for.",
  cta: "Open the link",
  link: { title: "", description: "", url: "", buttonLabel: "Get it now", active: true },
  active: true,
});

export function CampaignForm({
  campaignId,
  initial,
  media,
  sampleMedia,
  igHandle,
  username,
  mediaInUse,
}: {
  campaignId?: string;
  initial?: CampaignInput;
  media: InstagramMedia[];
  sampleMedia: boolean;
  igHandle: string | null;
  username: string;
  mediaInUse: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<CampaignInput>(
    initial ?? blank(media.find((m) => !mediaInUse.includes(m.id))?.id ?? ""),
  );
  const [kwInput, setKwInput] = useState("");
  const [testComment, setTestComment] = useState("Python please 🙏");

  const set = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setLink = <K extends keyof CampaignInput["link"]>(key: K, value: CampaignInput["link"][K]) =>
    setForm((f) => ({ ...f, link: { ...f.link, [key]: value } }));

  const addKeyword = () => {
    const kw = normalizeKeyword(kwInput);
    if (kw && kw.length <= KEYWORD_MAX_LENGTH && !form.keywords.includes(kw) && form.keywords.length < KEYWORDS_MAX) {
      set("keywords", [...form.keywords, kw]);
    }
    setKwInput("");
  };

  const selected = media.find((m) => m.id === form.mediaId);
  const storefrontUrl = `https://${APP_DOMAIN}/${username}?campaign=${campaignId ?? "…"}`;
  const anyComment = form.matchRule === "any";
  const needsKeyword = !anyComment && form.keywords.length === 0;
  const matched = matchKeyword(testComment, form.keywords, form.matchRule);
  const preview = form.message.replaceAll("{first_name}", "Priya").replaceAll("{username}", "priya.learns");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startSaving(async () => {
      const result = campaignId ? await updateCampaign(campaignId, form) : await createCampaign(form);
      if ("error" in result) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      toast(campaignId ? "Campaign saved" : "Campaign created");
      if (campaignId) router.refresh();
      else router.push(`/campaigns/${result.id}`);
    });
  }

  return (
    <form className="grid gap-6 xl:grid-cols-3" onSubmit={onSubmit}>
      <div className="space-y-6 xl:col-span-2">
        <FormError>{error}</FormError>

        <Card>
          <CardHeader title="1. Instagram content" description="Pick the post or Reel this campaign watches." />
          <div className="space-y-4 p-5">
            <Field label="Campaign name">
              <Input required maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Python Handbook Reel" />
            </Field>
            <Field label="Instagram account">
              <Select disabled defaultValue="acc"><option value="acc">{igHandle ? `@${igHandle}` : "Not connected"}</option></Select>
            </Field>
            {sampleMedia && (
              <Callout tone="yellow" title="Sample posts for testing">
                Instagram isn&apos;t connected yet, so these are placeholder posts. Campaigns on them won&apos;t receive real comments.
              </Callout>
            )}
            {media.length === 0 ? (
              <Callout title="Connect Instagram to pick a post" action={<LinkButton href="/instagram" size="sm">Connect</LinkButton>}>
                Your recent posts and Reels will appear here.
              </Callout>
            ) : (
              <div>
                <p className="mb-1.5 text-sm font-medium text-zinc-800">Post or Reel</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {media.map((m) => {
                    const taken = mediaInUse.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => set("mediaId", m.id)}
                        title={taken ? `${m.caption} (another active campaign uses this)` : m.caption}
                        className={cn(
                          "relative mx-auto block w-fit rounded-xl p-1 ring-2 transition",
                          form.mediaId === m.id ? "ring-violet-500" : "ring-transparent hover:ring-violet-200",
                          taken && "opacity-40",
                        )}
                      >
                        <MediaThumb id={m.id} type={m.type} thumbnailUrl={m.thumbnailUrl} size={64} />
                        {form.mediaId === m.id && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white ring-2 ring-white"><Check className="h-3 w-3" /></span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {selected.caption} · Posted {date(selected.postedAt)}
                    {mediaInUse.includes(selected.id) && <span className="text-amber-700"> · Another active campaign already uses this post</span>}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="2. Which comments get a DM" description="Reply to every comment, or only to comments with your keyword. Matching is case-insensitive." />
          <div className="space-y-4 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {MATCH_RULES.map((r) => (
                <label key={r.id} className={cn("cursor-pointer rounded-lg border p-3 text-sm", form.matchRule === r.id ? "border-violet-600 bg-violet-50" : "border-zinc-200")}>
                  <input type="radio" name="rule" className="sr-only" checked={form.matchRule === r.id} onChange={() => set("matchRule", r.id)} />
                  <span className="font-medium">{r.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{r.help}</span>
                </label>
              ))}
            </div>
            {anyComment ? (
              <p className="flex items-start gap-1.5 rounded-lg bg-violet-50 px-3 py-2.5 text-sm text-violet-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Everyone who comments on this post gets your DM, whatever they write. No keywords needed.
              </p>
            ) : (
            <div>
              <p className="mb-1.5 text-sm font-medium text-zinc-800">Keywords</p>
              <div className="flex gap-2">
                <Input
                  value={kwInput}
                  maxLength={KEYWORD_MAX_LENGTH}
                  onChange={(e) => setKwInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addKeyword(); } }}
                  placeholder="Type a keyword and press Enter"
                  disabled={form.keywords.length >= KEYWORDS_MAX}
                />
                <Button type="button" variant="secondary" onClick={addKeyword} disabled={form.keywords.length >= KEYWORDS_MAX}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.keywords.map((k) => (
                  <Badge key={k} tone="violet" className="font-mono">
                    {k}
                    <button type="button" onClick={() => set("keywords", form.keywords.filter((x) => x !== k))} aria-label={`Remove ${k}`}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
                {form.keywords.length === 0 && <p className="text-xs text-zinc-400">No keywords yet.</p>}
                {form.keywords.length >= KEYWORDS_MAX && <p className="text-xs text-zinc-400">Maximum {KEYWORDS_MAX} keywords.</p>}
              </div>
            </div>
            )}
            <div className="rounded-lg bg-zinc-50 p-3">
              <Field label="Test a comment">
                <Input value={testComment} onChange={(e) => setTestComment(e.target.value)} />
              </Field>
              <p className={cn("mt-2 text-xs font-medium", matched ? "text-emerald-700" : "text-zinc-500")}>
                {matched ? (anyComment ? "✓ Every comment gets a DM, so this one would too" : `✓ Matches “${matched}” — a DM would be sent`) : anyComment ? "✗ Empty comments are skipped" : "✗ No match — this comment would be skipped"}
              </p>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-zinc-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Each commenter gets at most one reply per campaign. Duplicate comments are skipped automatically.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="3. Automated DM" description="Sent as a private reply through Meta's official API." />
          <div className="space-y-4 p-5">
            <Field label="Message" hint={`${form.message.length}/${MESSAGE_MAX}`} help="Use {first_name} or {username} to personalise. Your storefront link is added automatically.">
              <Textarea rows={3} required maxLength={MESSAGE_MAX} value={form.message} onChange={(e) => set("message", e.target.value)} />
            </Field>
            <Field label="Call-to-action button text">
              <Input value={form.cta} onChange={(e) => set("cta", e.target.value)} maxLength={CTA_MAX} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="4. Campaign link (4th storefront link)" description="Shown alongside your three featured links only for visitors from this campaign." />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Link title"><Input required maxLength={60} value={form.link.title} onChange={(e) => setLink("title", e.target.value)} placeholder="Python Handbook" /></Field>
            <Field label="Button text"><Input maxLength={30} value={form.link.buttonLabel} onChange={(e) => setLink("buttonLabel", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Description" hint="(optional)"><Input maxLength={120} value={form.link.description} onChange={(e) => setLink("description", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Destination URL"><Input type="url" required value={form.link.url} onChange={(e) => setLink("url", e.target.value)} placeholder="https://" /></Field></div>
            <label className="flex items-center gap-2 text-sm">
              <Toggle checked={form.link.active} onChange={(v) => setLink("active", v)} label="Link active" /> Link active
            </label>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-8">
          <Card>
            <CardHeader title="DM preview" />
            <div className="space-y-2 bg-zinc-50 p-5">
              <div className="ml-6 whitespace-pre-line rounded-2xl rounded-tr-sm bg-violet-600 p-3 text-sm text-white">
                {preview}
                <span className="mt-2 block break-all text-xs underline opacity-90">{storefrontUrl}</span>
              </div>
              <div className="ml-6 rounded-xl border border-zinc-200 bg-white py-2 text-center text-sm font-medium text-violet-700">{form.cta || "Open the link"}</div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Campaign active</p>
                <p className="text-xs text-zinc-500">Start replying to new comments now.</p>
              </div>
              <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Campaign active" />
            </div>
            <Button type="submit" className="mt-5 w-full" disabled={saving || needsKeyword || !form.mediaId}>
              {saving ? "Saving…" : campaignId ? "Save changes" : "Create campaign"}
            </Button>
            {needsKeyword && <p className="mt-2 text-center text-xs text-zinc-400">Add at least one keyword, or choose “Any comment”.</p>}
          </Card>
        </div>
      </div>
    </form>
  );
}

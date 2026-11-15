"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, ImageIcon, Info, MessageCircle, Plus, Send, Sparkles, Trash2, X } from "lucide-react";
import { createCampaign, updateCampaign } from "@/app/(creator)/campaigns/actions";
import { dmLinkFor } from "@/lib/plan";
import {
  CTA_MAX, DELAY_OPTIONS, KEYWORD_MAX_LENGTH, KEYWORDS_MAX, MESSAGE_MAX, normalizeKeyword, POST_SCOPES, PUBLIC_REPLIES_MAX, PUBLIC_REPLY_MAX,
  type CampaignInput, type InstagramMedia,
} from "@/lib/campaigns";
import { hasExcludedWord, MATCH_RULES, matchKeyword } from "@/lib/keywords";
import { date } from "@/lib/format";
import { Toggle, useToast } from "./interactive";
import { Button, Callout, Card, cn, Field, FormError, Input, LinkButton, MediaThumb, Select, Textarea } from "./ui";

const SUGGESTED_REPLIES = ["Sent you a DM 📩", "Check your DMs {first_name} ✅", "Just sent it to your inbox 🙌"];

const blank = (mediaId: string): CampaignInput => ({
  name: "",
  postScope: "specific",
  mediaId,
  keywords: [],
  matchRule: "contains",
  message: "Hey {first_name}! Thanks for commenting 🙌 Here's what you asked for.",
  cta: "Get the link",
  link: { title: "", description: "", url: "", buttonLabel: "Get it now", active: true },
  active: true,
  delaySeconds: 0,
  followRequired: false,
  excludeKeywords: [],
  publicReplyEnabled: false,
  publicReplies: SUGGESTED_REPLIES,
});

const STEPS = [
  { id: "post", label: "Post" },
  { id: "trigger", label: "Keywords" },
  { id: "dm", label: "DM" },
  { id: "reply", label: "Comment reply" },
  { id: "extras", label: "Advanced" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const SAMPLE_NAME = "priya.learns";

export function CampaignForm({
  campaignId,
  initial,
  media,
  sampleMedia,
  igHandle,
  username,
  mediaInUse,
  storefront,
}: {
  campaignId?: string;
  initial?: CampaignInput;
  media: InstagramMedia[];
  sampleMedia: boolean;
  igHandle: string | null;
  username: string;
  mediaInUse: string[];
  storefront: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState("");
  const [step, setStep] = useState<StepId>("post");
  const [form, setForm] = useState<CampaignInput>(initial ?? blank(media.find((m) => !mediaInUse.includes(m.id))?.id ?? ""));
  const [testComment, setTestComment] = useState("Send me the LINK please 🙏");
  const [excludeOn, setExcludeOn] = useState((initial?.excludeKeywords.length ?? 0) > 0);

  const set = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setLink = <K extends keyof CampaignInput["link"]>(key: K, value: CampaignInput["link"][K]) =>
    setForm((f) => ({ ...f, link: { ...f.link, [key]: value } }));

  const selected = media.find((m) => m.id === form.mediaId);
  const anyComment = form.matchRule === "any";
  const matched = matchKeyword(testComment, form.keywords, form.matchRule);
  const excluded = excludeOn && hasExcludedWord(testComment, form.excludeKeywords);
  const getsDm = !!matched && !excluded;
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const handle = igHandle ?? username;
  const linkTarget = dmLinkFor({ username, campaignId: campaignId ?? "…", storefront });

  // What's missing before a step is complete (null when it's fine).
  function problem(id: StepId): string | null {
    if (id === "post") {
      if (!form.name.trim()) return "Give your campaign a name.";
      if (form.postScope === "specific" && !form.mediaId) return "Pick the post or Reel this campaign watches.";
    }
    if (id === "trigger" && !anyComment && !form.keywords.length) return "Add at least one keyword, or turn on “Any comment”.";
    if (id === "dm") {
      if (!form.message.trim()) return "Write the DM message.";
      if (!/^https?:\/\/\S+\.\S+/i.test(form.link.url.trim())) return "Enter the link URL, starting with https://";
    }
    if (id === "reply" && form.publicReplyEnabled && !form.publicReplies.some((r) => r.trim())) return "Add at least one public reply, or turn it off.";
    return null;
  }

  function go(to: StepId) {
    setError("");
    setStep(to);
  }

  function next() {
    const p = problem(step);
    if (p) return setError(p);
    go(STEPS[stepIndex + 1].id);
  }

  function save() {
    const firstBad = STEPS.find((s) => problem(s.id));
    if (firstBad) {
      setStep(firstBad.id);
      return setError(problem(firstBad.id)!);
    }
    setError("");
    const input: CampaignInput = {
      ...form,
      excludeKeywords: excludeOn ? form.excludeKeywords : [],
      publicReplies: form.publicReplies.map((r) => r.trim()).filter(Boolean),
    };
    startSaving(async () => {
      const result = campaignId ? await updateCampaign(campaignId, input) : await createCampaign(input);
      if ("error" in result) return setError(result.error);
      toast(campaignId ? "Campaign saved" : "Campaign is live");
      if (campaignId) router.refresh();
      else router.push(`/campaigns/${result.id}`);
    });
  }

  const last = stepIndex === STEPS.length - 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="flex min-h-[600px] flex-col">
        {/* Step tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex && !problem(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
                  step === s.id ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                  step === s.id ? "bg-violet-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500",
                )}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-5 p-5 sm:p-6">
          <FormError>{error}</FormError>

          {step === "post" && (
            <>
              <Field label="Campaign name">
                <Input maxLength={80} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Free Python notes Reel" />
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-800">Which posts should this campaign watch?</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {POST_SCOPES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => set("postScope", p.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition",
                        form.postScope === p.id ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/15" : "border-zinc-200 hover:border-violet-200",
                      )}
                    >
                      <span className="text-sm font-semibold text-zinc-900">{p.label}</span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{p.help}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.postScope === "specific" && (
                <>
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
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
                        {media.map((m) => {
                          const taken = mediaInUse.includes(m.id);
                          const on = form.mediaId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => set("mediaId", m.id)}
                              title={taken ? `${m.caption} (another live campaign uses this)` : m.caption}
                              className={cn(
                                "relative overflow-hidden rounded-xl ring-2 transition",
                                on ? "ring-violet-500" : "ring-transparent hover:ring-violet-200",
                                taken && "opacity-40",
                              )}
                            >
                              <div className="aspect-[4/5] w-full bg-zinc-100">
                                {m.thumbnailUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center"><MediaThumb id={m.id} type={m.type} thumbnailUrl={null} size={56} /></div>
                                )}
                              </div>
                              {m.thumbnailUrl && <span className="absolute bottom-1.5 left-1.5 rounded bg-black/50 px-1.5 text-[10px] font-medium text-white">{m.type}</span>}
                              {on && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white ring-2 ring-white"><Check className="h-3.5 w-3.5" /></span>}
                            </button>
                          );
                        })}
                      </div>
                      {selected && (
                        <p className="mt-3 text-xs text-zinc-500">
                          {selected.caption || "No caption"} · Posted {date(selected.postedAt)}
                          {mediaInUse.includes(selected.id) && <span className="text-amber-700"> · Another live campaign already uses this post</span>}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
              {form.postScope === "any" && (
                <Note>Every post and Reel on @{handle} is covered, including ones you publish later. A campaign set on a specific post always wins over this one.</Note>
              )}
              {form.postScope === "next" && (
                <Note>The campaign waits for the next post or Reel you publish, then starts on it automatically. Only comments made after you create the campaign count.</Note>
              )}
            </>
          )}

          {step === "trigger" && (
            <>
              <Row title="Any comment" body="Everyone who comments gets the DM, whatever they write.">
                <Toggle checked={anyComment} onChange={(v) => set("matchRule", v ? "any" : "contains")} label="Any comment" />
              </Row>

              {!anyComment && (
                <>
                  <WordList
                    label="Comment should include any of these"
                    placeholder="Type a keyword, e.g. LINK"
                    words={form.keywords}
                    onChange={(w) => set("keywords", w)}
                  />
                  <Field label="How to match">
                    <Select value={form.matchRule} onChange={(e) => set("matchRule", e.target.value as CampaignInput["matchRule"])}>
                      {MATCH_RULES.filter((r) => r.id !== "any").map((r) => <option key={r.id} value={r.id}>{r.label}: {r.help}</option>)}
                    </Select>
                  </Field>
                </>
              )}

              <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
                <label className="flex items-center gap-2.5 text-sm font-medium text-zinc-900">
                  <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={excludeOn} onChange={(e) => setExcludeOn(e.target.checked)} />
                  Exclude words
                </label>
                <p className="-mt-1 text-xs text-zinc-500">Comments with any of these words never get a DM (for example spam or rude words).</p>
                {excludeOn && <WordList placeholder="Type a word to block" words={form.excludeKeywords} onChange={(w) => set("excludeKeywords", w)} />}
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <Field label="Try a comment">
                  <Input value={testComment} onChange={(e) => setTestComment(e.target.value)} />
                </Field>
                <p className={cn("mt-2 text-xs font-medium", getsDm ? "text-emerald-700" : "text-zinc-500")}>
                  {excluded ? "✗ Has an excluded word, so no DM" : getsDm ? (anyComment ? "✓ Every comment gets a DM" : `✓ Matches “${matched}”, a DM would be sent`) : anyComment ? "✗ Empty comments are skipped" : "✗ No keyword match, so no DM"}
                </p>
              </div>
              <Note>Keywords aren&apos;t case-sensitive. Each person gets one DM per campaign, even if they comment again.</Note>
            </>
          )}

          {step === "dm" && (
            <>
              <Field label="Message" hint={`${form.message.length}/${MESSAGE_MAX}`} help="Use {first_name} or {username} to personalise it.">
                <Textarea rows={4} maxLength={MESSAGE_MAX} value={form.message} onChange={(e) => set("message", e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button text" hint={`${form.cta.length}/${CTA_MAX}`}>
                  <Input value={form.cta} maxLength={CTA_MAX} onChange={(e) => set("cta", e.target.value)} placeholder="Get the link" />
                </Field>
                <Field label="Button link">
                  <Input type="url" value={form.link.url} onChange={(e) => setLink("url", e.target.value)} placeholder="https://" />
                </Field>
              </div>
              {storefront && (
                <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
                  <p className="text-sm font-medium text-zinc-900">Storefront card for this campaign</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Card title"><Input maxLength={60} value={form.link.title} onChange={(e) => setLink("title", e.target.value)} placeholder={form.name || "Python Handbook"} /></Field>
                    <Field label="Card button"><Input maxLength={30} value={form.link.buttonLabel} onChange={(e) => setLink("buttonLabel", e.target.value)} /></Field>
                  </div>
                  <Field label="Description" hint="(optional)"><Input maxLength={120} value={form.link.description} onChange={(e) => setLink("description", e.target.value)} /></Field>
                  <label className="flex items-center gap-2 text-sm"><Toggle checked={form.link.active} onChange={(v) => setLink("active", v)} label="Card visible" /> Card visible</label>
                </div>
              )}
              <Note>
                Sent as a private reply to the comment through Meta&apos;s official API. The button opens {storefront ? "your storefront with this link on top" : "your link directly"}.
              </Note>
            </>
          )}

          {step === "reply" && (
            <>
              <Row title="Public reply to the comment" body="Reply under their comment so others see that DMs really arrive.">
                <Toggle checked={form.publicReplyEnabled} onChange={(v) => set("publicReplyEnabled", v)} label="Public reply" />
              </Row>
              {form.publicReplyEnabled && (
                <div className="space-y-2">
                  {form.publicReplies.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 shrink-0 text-violet-500" />
                      <Input
                        value={r}
                        maxLength={PUBLIC_REPLY_MAX}
                        onChange={(e) => set("publicReplies", form.publicReplies.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder="e.g. Sent you a DM 📩"
                      />
                      <button
                        type="button"
                        aria-label="Remove reply"
                        onClick={() => set("publicReplies", form.publicReplies.filter((_, j) => j !== i))}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {form.publicReplies.length < PUBLIC_REPLIES_MAX && (
                    <button
                      type="button"
                      onClick={() => set("publicReplies", [...form.publicReplies, ""])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-violet-300 bg-violet-50/50 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
                    >
                      <Plus className="h-4 w-4" /> Add reply
                    </button>
                  )}
                  <Note>One reply is picked at random for each comment, so they don&apos;t all look the same. Use {"{first_name}"} to add their name.</Note>
                </div>
              )}
              {!form.publicReplyEnabled && <Note>Off: people only get the DM, and nothing is posted under their comment.</Note>}
            </>
          )}

          {step === "extras" && (
            <>
              <Row title="Follow before DM" body="People who don't follow you are asked to follow first, then tap a button to get the link.">
                <Toggle checked={form.followRequired} onChange={(v) => set("followRequired", v)} label="Follow before DM" />
              </Row>
              <Field label="Send the DM" help={form.delaySeconds ? "A short delay feels more human. Delayed DMs go out within a minute of the chosen time." : undefined}>
                <Select value={form.delaySeconds} onChange={(e) => set("delaySeconds", Number(e.target.value))}>
                  {DELAY_OPTIONS.map((d) => <option key={d.seconds} value={d.seconds}>{d.label}</option>)}
                </Select>
              </Field>
              <Row title="Campaign live" body="Start replying to new comments as soon as you save.">
                <Toggle checked={form.active} onChange={(v) => set("active", v)} label="Campaign live" />
              </Row>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 p-4 sm:px-6">
          {stepIndex > 0 ? (
            <Button type="button" variant="secondary" onClick={() => go(STEPS[stepIndex - 1].id)}><ArrowLeft className="h-4 w-4" /> Back</Button>
          ) : <span />}
          <div className="flex gap-2">
            {campaignId && !last && <Button type="button" variant="secondary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
            {last ? (
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? "Saving…" : campaignId ? "Save changes" : <><Sparkles className="h-4 w-4" /> Launch campaign</>}
              </Button>
            ) : (
              <Button type="button" onClick={next}>Next <ArrowRight className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </Card>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Phone>
          <Preview step={step} form={form} handle={handle} selected={selected} testComment={testComment} getsDm={getsDm} storefront={storefront} linkTarget={linkTarget} />
        </Phone>
        <p className="mt-3 text-center text-xs text-zinc-400">Live preview</p>
      </div>
    </div>
  );
}

// ---------- small pieces ----------

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-xl bg-violet-50/70 px-3 py-2.5 text-xs leading-relaxed text-violet-900">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Row({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 p-4">
      <div>
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{body}</p>
      </div>
      {children}
    </div>
  );
}

function WordList({ label, placeholder, words, onChange }: { label?: string; placeholder: string; words: string[]; onChange: (w: string[]) => void }) {
  const [value, setValue] = useState("");
  const full = words.length >= KEYWORDS_MAX;
  const add = () => {
    const kw = normalizeKeyword(value);
    if (kw && kw.length <= KEYWORD_MAX_LENGTH && !words.includes(kw) && !full) onChange([...words, kw]);
    setValue("");
  };
  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-zinc-800">{label}</p>}
      <div className="flex gap-2">
        <Input
          value={value}
          maxLength={KEYWORD_MAX_LENGTH}
          disabled={full}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add} disabled={full}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {words.map((k) => (
          <span key={k} className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-zinc-800">
            {k}
            <button type="button" onClick={() => onChange(words.filter((x) => x !== k))} aria-label={`Remove ${k}`} className="text-zinc-400 hover:text-red-600"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {full && <p className="text-xs text-zinc-400">Maximum {KEYWORDS_MAX}.</p>}
      </div>
    </div>
  );
}

// ---------- phone preview ----------

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-xl shadow-violet-900/10">
      <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[1.8rem] bg-white">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-900" />
        <div className="flex-1 overflow-hidden pt-9">{children}</div>
      </div>
    </div>
  );
}

function Preview({
  step, form, handle, selected, testComment, getsDm, storefront, linkTarget,
}: {
  step: StepId; form: CampaignInput; handle: string; selected?: InstagramMedia; testComment: string; getsDm: boolean; storefront: boolean; linkTarget: string;
}) {
  const fill = (t: string) => t.replaceAll("{first_name}", "Priya").replaceAll("{username}", `@${SAMPLE_NAME}`);

  if (step === "post") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-3 pb-2">
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
          <span className="text-xs font-semibold">{handle}</span>
        </div>
        <div className="flex aspect-[4/5] items-center justify-center bg-zinc-100">
          {form.postScope === "specific" && selected?.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="px-6 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-2 text-xs font-medium text-zinc-500">
                {form.postScope === "any" ? "All your posts and Reels" : form.postScope === "next" ? "Your next post or Reel" : "Pick a post"}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-3 py-2 text-zinc-800"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" /></div>
        <p className="line-clamp-2 px-3 text-xs"><span className="font-semibold">{handle}</span> {form.postScope === "specific" ? selected?.caption : "Comment LINK and I'll DM it to you 👇"}</p>
      </div>
    );
  }

  if (step === "trigger" || step === "reply") {
    const reply = form.publicReplies.find((r) => r.trim());
    return (
      <div className="flex h-full flex-col">
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-zinc-300" />
        <p className="border-b border-zinc-100 pb-2 text-center text-sm font-semibold">Comments</p>
        <div className="space-y-4 p-3">
          <Comment name={SAMPLE_NAME} text={step === "trigger" ? testComment || "…" : "Send me the LINK please 🙏"} />
          {step === "trigger" && (
            <p className={cn("ml-9 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold", getsDm ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
              {getsDm ? "✓ Gets your DM" : "No DM"}
            </p>
          )}
          {step === "reply" && form.publicReplyEnabled && reply && (
            <div className="ml-9"><Comment name={handle} text={fill(reply)} creator /></div>
          )}
          {step === "reply" && !form.publicReplyEnabled && <p className="pt-10 text-center text-xs text-zinc-400">No public reply</p>}
        </div>
      </div>
    );
  }

  // DM thread (dm + extras)
  const followFlow = step === "extras" && form.followRequired;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-3 pb-2">
        <ArrowLeft className="h-4 w-4" />
        <span className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <span className="text-xs font-semibold">{handle}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden p-3">
        <p className="text-center text-[10px] text-zinc-400">
          {step === "extras" && form.delaySeconds ? DELAY_OPTIONS.find((d) => d.seconds === form.delaySeconds)?.label : "Replied to your comment"}
        </p>
        <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-bl-sm bg-zinc-100">
          <p className="whitespace-pre-line p-3 text-xs text-zinc-900">
            {fill(form.message) || "Your message"}
            {followFlow && <><br /><br />Tap below to get your link 👇</>}
          </p>
          {!followFlow && (
            <div className="border-t border-zinc-200 bg-white py-2 text-center text-xs font-semibold text-violet-700" title={linkTarget}>
              {(form.cta || "Get the link").slice(0, 20)}
            </div>
          )}
        </div>
        {followFlow && (
          <>
            <div className="flex justify-end"><span className="rounded-full border border-violet-300 px-3 py-1 text-[11px] font-medium text-violet-700">{(form.cta || "Get the link").slice(0, 20)}</span></div>
            <p className="pt-1 text-center text-[10px] text-zinc-400">If they follow you</p>
            <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-bl-sm bg-zinc-100">
              <p className="p-3 text-xs">Thanks for following! 🙌 Here&apos;s your link:</p>
              <div className="border-t border-zinc-200 bg-white py-2 text-center text-xs font-semibold text-violet-700">{(form.cta || "Get the link").slice(0, 20)}</div>
            </div>
          </>
        )}
        {step === "dm" && <p className="pt-1 text-[10px] text-zinc-400">Button opens {storefront ? "your storefront" : form.link.url || "your link"}</p>}
      </div>
      <div className="m-3 flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-[11px] text-zinc-400">Message…</div>
    </div>
  );
}

function Comment({ name, text, creator }: { name: string; text: string; creator?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className={cn("h-7 w-7 shrink-0 rounded-full", creator ? "bg-gradient-to-br from-violet-500 to-pink-500" : "bg-gradient-to-br from-amber-300 to-rose-400")} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold">{name} <span className="font-normal text-zinc-400">now</span></p>
        <p className="break-words text-xs text-zinc-800">{text}</p>
        <p className="mt-0.5 text-[10px] font-medium text-zinc-400">Reply</p>
      </div>
      <Heart className="h-3 w-3 text-zinc-300" />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Plus, Trash2 } from "lucide-react";
import { StorefrontView } from "@/components/storefront-view";
import { Tabs, Toggle, useToast } from "@/components/interactive";
import { Button, Card, CardHeader, cn, Field, FormError, Input, LinkButton, PageHeader, Select, Textarea } from "@/components/ui";
import { APP_DOMAIN } from "@/lib/config";
import {
  BIO_MAX, SOCIAL_PLATFORMS,
  type CampaignOption, type FeaturedLink, type FourthLink, type Social, type StoreLink, type StoreProfile,
} from "@/lib/storefront";
import { saveStorefront } from "./actions";

const BRAND_SWATCHES = ["#3f79c9", "#e47a54", "#2563eb", "#059669", "#ea580c", "#18181b"];

type Tab = "links" | "profile" | "appearance";

// Shrinks a photo in the browser (phone photos are often 5–10 MB) to a JPEG
// no larger than `max` px on its longest side, so uploads are small and quick.
async function shrink(file: File, max: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.88));
}

// Uploads go straight to Cloudflare R2 and are saved immediately (no need to press Save).
function ImageSlot({ kind, label, value, shape, onChange }: {
  kind: "avatar" | "cover";
  label: string;
  value: string | null;
  shape: "circle" | "wide";
  onChange: (url: string | null) => void;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(request: Promise<Response>, done: string) {
    setBusy(true);
    setError("");
    try {
      const res = await request;
      const data = (await res.json().catch(() => ({}))) as { url?: string | null; error?: string };
      if (!res.ok || data.url === undefined) throw new Error(data.error || "Upload failed. Please try again.");
      onChange(data.url);
      toast(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    let blob: Blob;
    try {
      blob = await shrink(file, kind === "avatar" ? 512 : 1600);
    } catch {
      return setError("Couldn't read that image. Try a JPG or PNG.");
    }
    const form = new FormData();
    form.set("kind", kind);
    form.set("file", blob, `${kind}.jpg`);
    await send(fetch("/api/uploads/storefront", { method: "POST", body: form }), `${label} updated`);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-zinc-800">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label={`Upload ${label.toLowerCase()}`}
          className={cn("flex shrink-0 items-center justify-center overflow-hidden bg-zinc-100 text-zinc-400", shape === "circle" ? "h-16 w-16 rounded-full" : "h-16 w-32 rounded-lg", busy && "animate-pulse")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5" />}
        </button>
        <div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? "Uploading…" : value ? "Change" : "Upload"}
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" disabled={busy}
                onClick={() => send(fetch(`/api/uploads/storefront?kind=${kind}`, { method: "DELETE" }), `${label} removed`)}>
                Remove
              </Button>
            )}
          </div>
          <p className={cn("mt-1 text-xs", error ? "text-red-600" : "text-zinc-500")}>
            {error || (shape === "circle" ? "Square image works best. JPG, PNG or WebP." : "Wide image, about 3:1. JPG, PNG or WebP.")}
          </p>
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function LinkFields({ link, onChange }: { link: StoreLink; onChange: (patch: Partial<StoreLink>) => void }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", !link.active && "opacity-50")}>
      <Field label="Title"><Input value={link.title} maxLength={60} onChange={(e) => onChange({ title: e.target.value })} /></Field>
      <Field label="Button label"><Input value={link.buttonLabel} maxLength={30} onChange={(e) => onChange({ buttonLabel: e.target.value })} /></Field>
      <Field label="Description"><Input value={link.description} maxLength={120} onChange={(e) => onChange({ description: e.target.value })} /></Field>
      <Field label="Destination URL"><Input type="url" placeholder="https://" value={link.url} onChange={(e) => onChange({ url: e.target.value })} /></Field>
    </div>
  );
}

export function StorefrontEditor({
  initialProfile,
  initialFeatured,
  initialFallback,
  campaigns,
}: {
  initialProfile: StoreProfile;
  initialFeatured: FeaturedLink[];
  initialFallback: StoreLink;
  campaigns: CampaignOption[];
}) {
  const toast = useToast();
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("links");
  const [profile, setProfile] = useState(initialProfile);
  const [savedUsername, setSavedUsername] = useState(initialProfile.username);
  const [links, setLinks] = useState(initialFeatured);
  const [fallback, setFallback] = useState(initialFallback);
  const [previewCampaign, setPreviewCampaign] = useState(campaigns.find((c) => c.active)?.id ?? "");

  const updateLink = (position: number, patch: Partial<StoreLink>) =>
    setLinks((ls) => ls.map((l) => (l.position === position ? { ...l, ...patch } : l)));
  // Swap contents; slots keep their positions 1–3.
  const move = (index: number, dir: -1 | 1) =>
    setLinks((ls) => {
      const next = [...ls];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next.map((l, i) => ({ ...l, position: (i + 1) as 1 | 2 | 3 }));
    });
  const setSocial = (i: number, patch: Partial<Social>) =>
    setProfile((p) => ({ ...p, socials: p.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const setTheme = (patch: Partial<StoreProfile["theme"]>) => setProfile((p) => ({ ...p, theme: { ...p.theme, ...patch } }));

  const campaign = campaigns.find((c) => c.id === previewCampaign && c.active && c.link.active);
  const previewFourth: FourthLink | null = campaign
    ? { ...campaign.link, source: "campaign" }
    : fallback.active && fallback.title && fallback.url
      ? { ...fallback, source: "default" }
      : null;

  function save() {
    setError("");
    startSaving(async () => {
      const result = await saveStorefront({ profile, featured: links, fallback });
      if ("error" in result) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSavedUsername(profile.username);
      toast("Storefront saved");
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Storefront"
        description={`${APP_DOMAIN}/${savedUsername}`}
        actions={
          <>
            <LinkButton href={`/${savedUsername}`} target="_blank" variant="secondary"><ExternalLink className="h-4 w-4" /> View live</LinkButton>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save & publish"}</Button>
          </>
        }
      />

      <div className="mb-4"><FormError>{error}</FormError></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "links", label: "Links" }, { id: "profile", label: "Profile" }, { id: "appearance", label: "Appearance" }]} />

          {tab === "links" && (
            <>
              <Card>
                <CardHeader title="Featured links" description="These three links appear on every storefront visit, for every campaign. Leave a slot empty to hide it." />
                <div className="divide-y divide-zinc-100">
                  {links.map((l, i) => (
                    <div key={l.position} className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Link {i + 1}</p>
                        <div className="flex items-center gap-1">
                          <Button type="button" size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                          <Button type="button" size="sm" variant="ghost" disabled={i === links.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                          <Toggle checked={l.active} onChange={(v) => updateLink(l.position, { active: v })} label={`Link ${i + 1} active`} />
                        </div>
                      </div>
                      <LinkFields link={l} onChange={(patch) => updateLink(l.position, patch)} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Default fourth link"
                  description="Shown when someone visits without a campaign link. Each campaign sets its own fourth link."
                  action={<Toggle checked={fallback.active} onChange={(v) => setFallback({ ...fallback, active: v })} label="Default link active" />}
                />
                <div className="p-5">
                  <LinkFields link={fallback} onChange={(patch) => setFallback({ ...fallback, ...patch })} />
                </div>
              </Card>
            </>
          )}

          {tab === "profile" && (
            <Card className="space-y-5 p-5">
              <ImageSlot kind="avatar" label="Profile picture" value={profile.avatarUrl} shape="circle" onChange={(url) => setProfile((p) => ({ ...p, avatarUrl: url }))} />
              <ImageSlot kind="cover" label="Cover image" value={profile.coverUrl} shape="wide" onChange={(url) => setProfile((p) => ({ ...p, coverUrl: url }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name"><Input value={profile.name} maxLength={80} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
                <Field label="Username" help="Changing this changes your storefront URL. Old links will stop working.">
                  <Input value={profile.username} maxLength={30} onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })} />
                </Field>
              </div>
              <Field label="Bio" hint={`${profile.bio.length}/${BIO_MAX}`}>
                <Textarea rows={3} maxLength={BIO_MAX} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </Field>
              <div>
                <p className="mb-1.5 text-sm font-medium text-zinc-800">Social links</p>
                <div className="space-y-2">
                  {profile.socials.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <Select className="w-36" value={s.platform} onChange={(e) => setSocial(i, { platform: e.target.value })}>
                        {SOCIAL_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                      </Select>
                      <Input type="url" placeholder="https://" value={s.url} onChange={(e) => setSocial(i, { url: e.target.value })} />
                      <Button type="button" variant="ghost" onClick={() => setProfile({ ...profile, socials: profile.socials.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {profile.socials.length < 10 && (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setProfile({ ...profile, socials: [...profile.socials, { platform: "Website", url: "" }] })}>
                      <Plus className="h-4 w-4" /> Add social link
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {tab === "appearance" && (
            <Card className="space-y-6 p-5">
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-800">Brand colour</p>
                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTheme({ brand: c })}
                      className={cn("h-8 w-8 rounded-full ring-2 ring-offset-2", profile.theme.brand === c ? "ring-zinc-900" : "ring-transparent")}
                      style={{ background: c }}
                      aria-label={`Brand colour ${c}`}
                    />
                  ))}
                  <input type="color" value={profile.theme.brand} onChange={(e) => setTheme({ brand: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-zinc-200" aria-label="Custom brand colour" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-800">Theme</p>
                <div className="grid grid-cols-2 gap-2 sm:w-80">
                  {(["light", "dark"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setTheme({ style: s })}
                      className={cn("rounded-lg border p-3 text-sm font-medium capitalize", profile.theme.style === s ? "border-violet-600 bg-violet-50" : "border-zinc-200")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-800">Button style</p>
                <div className="grid grid-cols-3 gap-2 sm:w-96">
                  {(["pill", "rounded", "square"] as const).map((b) => (
                    <button key={b} type="button" onClick={() => setTheme({ button: b })}
                      className={cn("border p-3 text-sm font-medium capitalize", b === "pill" ? "rounded-full" : b === "rounded" ? "rounded-lg" : "rounded-none", profile.theme.button === b ? "border-violet-600 bg-violet-50" : "border-zinc-200")}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-medium">Preview as</p>
            <Select value={previewCampaign} onChange={(e) => setPreviewCampaign(e.target.value)} className="h-8 text-xs">
              <option value="">No campaign (direct visit)</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (paused)"}</option>)}
            </Select>
          </div>
          <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border-8 border-zinc-900 shadow-xl">
            <div className="h-[640px] overflow-y-auto">
              <StorefrontView
                profile={{ ...profile, name: profile.name || profile.username }}
                featured={links.filter((l) => l.active && l.title && l.url)}
                fourth={previewFourth}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

const BRAND_SWATCHES = ["#7c3aed", "#db2777", "#2563eb", "#059669", "#ea580c", "#18181b"];

type Tab = "links" | "profile" | "appearance";

// Uploads switch on once image storage (Cloudflare R2) is connected.
function ImageSlot({ label, value, shape }: { label: string; value: string | null; shape: "circle" | "wide" }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-zinc-800">{label}</p>
      <div className="flex items-center gap-4">
        <div className={cn("flex shrink-0 items-center justify-center overflow-hidden bg-zinc-100 text-zinc-400", shape === "circle" ? "h-16 w-16 rounded-full" : "h-16 w-32 rounded-lg")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5" />}
        </div>
        <div>
          <Button type="button" size="sm" variant="secondary" disabled>Upload</Button>
          <p className="mt-1 text-xs text-zinc-500">Image uploads are coming soon.</p>
        </div>
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
              <ImageSlot label="Profile picture" value={profile.avatarUrl} shape="circle" />
              <ImageSlot label="Cover image" value={profile.coverUrl} shape="wide" />
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

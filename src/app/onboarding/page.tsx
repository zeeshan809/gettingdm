"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Instagram, Link2, Zap } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { Button, buttonClass, Callout, Card, cn, Field, FormError, Input, LinkButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { title: "Connect Instagram", icon: Instagram },
  { title: "Add your three featured links", icon: Link2 },
  { title: "Create your first campaign", icon: Zap },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState<string | null>(null);
  const [connectError, setConnectError] = useState("");

  // Coming back from Meta: show the real connected account (or why it failed).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setConnectError(params.get("error") === "cancelled" ? "Connection cancelled. You can try again or skip this step." : "We couldn't connect Instagram. You can try again from the Instagram page later.");
    }
    createClient().from("instagram_accounts").select("username, status").maybeSingle().then(({ data }) => {
      if (data?.status === "connected") setHandle(data.username);
    });
  }, []);
  const [links, setLinks] = useState(
    ["My Website", "Join My Community", "Explore My Courses"].map((title) => ({ title, url: "" })),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveLinks() {
    const supabase = createClient();
    const rows = links
      .map((l, i) => ({ position: i + 1, title: l.title.trim(), url: l.url.trim() }))
      .filter((l) => l.title && l.url);
    if (rows.length) {
      const { error } = await supabase.from("featured_links").upsert(rows, { onConflict: "creator_id,position" });
      if (error) return error.message;
    }
    const { data } = await supabase.auth.getUser();
    if (data.user) await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", data.user.id);
    return "";
  }

  async function next() {
    if (step === 1) {
      if (links.some((l) => l.url.trim() && !/^https?:\/\//i.test(l.url.trim()))) {
        setError("Links must start with https://");
        return;
      }
      setBusy(true);
      const err = await saveLinks();
      setBusy(false);
      setError(err);
      if (err) return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-lg font-semibold">{APP_NAME}</Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Let&apos;s get your first automation live</h1>
      <p className="mt-1 text-sm text-zinc-500">Your 30-day free trial has started. This takes about 3 minutes.</p>

      <ol className="mt-8 flex gap-2">
        {steps.map((s, i) => (
          <li key={s.title} className="flex-1">
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-violet-600" : "bg-zinc-200")} />
            <p className={cn("mt-2 text-xs font-medium", i === step ? "text-violet-700" : "text-zinc-500")}>{i + 1}. {s.title}</p>
          </li>
        ))}
      </ol>

      <Card className="mt-6 p-6">
        {step === 0 && (
          <div className="text-center">
            <Instagram className="mx-auto h-10 w-10 text-pink-600" />
            <h2 className="mt-3 font-semibold">Connect your Instagram professional account</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
              You&apos;ll be sent to Meta to approve access. We never ask for or store your Instagram password.
            </p>
            {connectError && <div className="mt-4 text-left"><Callout tone="yellow" title="Not connected">{connectError}</Callout></div>}
            {handle ? (
              <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> Connected as @{handle}
              </p>
            ) : (
              // eslint-disable-next-line @next/next/no-html-link-for-pages -- redirects off-site to Meta
              <a href="/api/instagram/connect?next=/onboarding" className={buttonClass("primary", "md", "mt-5")}>Continue with Meta</a>
            )}
            <p className="mt-4 text-xs text-zinc-400">Requires an Instagram Business or Creator account. You can log in with Instagram or Facebook.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-zinc-500">These three links show on every storefront visit, across all campaigns. You can change them any time.</p>
            <FormError>{error}</FormError>
            {links.map((link, i) => {
              const set = (patch: Partial<typeof link>) => setLinks((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
              return (
                <div key={i} className="grid gap-3 sm:grid-cols-2">
                  <Field label={`Link ${i + 1} title`}><Input value={link.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} /></Field>
                  <Field label="Destination URL"><Input type="url" placeholder="https://" value={link.url} onChange={(e) => set({ url: e.target.value })} /></Field>
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <Zap className="mx-auto h-10 w-10 text-violet-600" />
            <h2 className="mt-3 font-semibold">You&apos;re all set up</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
              Pick a Reel, choose a keyword like <span className="font-mono font-medium text-zinc-800">PYTHON</span>, and we&apos;ll DM everyone who comments it.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <LinkButton href="/campaigns/new">Create campaign</LinkButton>
              <LinkButton href="/dashboard" variant="secondary">Go to dashboard</LinkButton>
            </div>
          </div>
        )}
      </Card>

      {step < 2 && (
        <div className="mt-4 flex justify-between">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800">Skip for now</Link>
          <Button onClick={next} variant={step === 0 && !handle ? "secondary" : "primary"} disabled={busy}>{busy ? "Saving…" : step === 0 && !handle ? "Connect later" : "Continue"}</Button>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight, BarChart3, Check, ChevronDown, Dumbbell, GraduationCap, Link2, Lock, MessageCircle,
  MousePointerClick, Plug, Rocket, Send, ShieldCheck, ShoppingBag, Sparkles, Store, Tag, Zap,
} from "lucide-react";
import { APP_DOMAIN, APP_NAME, PLANS, SUPPORT_EMAIL, TRIAL_DAYS } from "@/lib/config";
import { Logo } from "@/components/logo";
import { LandingMenu } from "@/components/landing-menu";

const primaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700";
const secondaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700";

const niches = [
  "Educators", "Fitness coaches", "Finance creators", "D2C brands", "Course sellers",
  "Affiliate pages", "Food bloggers", "Travel creators", "Beauty creators", "Career mentors",
];

const featureGrid = [
  { icon: Tag, title: "Keyword triggers", body: "Pick the word your audience comments. Anyone who types it gets your DM." },
  { icon: MessageCircle, title: "Reels and posts", body: "Run a campaign on any Reel or post, and keep each one separate." },
  { icon: Store, title: "Creator storefront", body: "One clean page with your profile, socials and every link you share.", plus: true },
  { icon: Link2, title: "Campaign link", body: "A fourth link that changes per Reel, so each audience lands on the right offer.", plus: true },
  { icon: BarChart3, title: "Funnel analytics", body: "Comments, DMs, visits and clicks by day, by campaign and by link." },
  { icon: ShieldCheck, title: "Official Meta login", body: "Connect with Meta's own login. We never see or store your password." },
];

const steps = [
  { icon: Plug, title: "Connect Instagram", body: "Log in with Meta in one click. No password shared, nothing to install." },
  { icon: Tag, title: "Pick a Reel and a keyword", body: "Choose the post, set the comment keyword and the link you want to send." },
  { icon: Rocket, title: "Go live", body: "Every matching comment gets your DM within seconds, day and night." },
];

const stats = [
  { value: "24/7", label: "Replies while you sleep" },
  { value: "₹99", label: "Per month to start" },
  { value: `${TRIAL_DAYS} days`, label: "Free trial on every plan" },
  { value: "0", label: "Passwords shared with us" },
];

const useCases = [
  { icon: GraduationCap, who: "Educators", keyword: "NOTES", sends: "Free PDF notes and a link to the full course." },
  { icon: Dumbbell, who: "Fitness coaches", keyword: "PLAN", sends: "A 7-day workout plan and a booking link for coaching." },
  { icon: ShoppingBag, who: "D2C brands", keyword: "PRICE", sends: "The product page with a discount code for commenters." },
  { icon: Sparkles, who: "Affiliate creators", keyword: "LINK", sends: "Every product from the Reel, on one storefront." },
];

const faqs = [
  { q: "Is this safe for my Instagram account?", a: `${APP_NAME} uses Meta's official Instagram API and only replies to people who comment on your posts first, which is exactly what Meta allows.` },
  { q: "Do I have to share my Instagram password?", a: "No. You connect through Meta's own login screen. We never see or store your password." },
  { q: "What kind of Instagram account do I need?", a: "A Professional account (Creator or Business). Switching is free and takes a minute in the Instagram app." },
  { q: "Is there a free trial?", a: `Yes. Every plan starts with a ${TRIAL_DAYS}-day free trial, and you can cancel any time.` },
  { q: "What is the difference between Creator and Creator Plus?", a: "Creator (₹99) covers comment-to-DM automation with unlimited DMs and campaigns. Creator Plus (₹299) adds your own link storefront with three fixed links, a per-campaign link and full analytics." },
  { q: "Does it work on other platforms?", a: "Instagram only for now. That is where comment-to-DM works best for creators." },
  { q: "How do payments work?", a: "Payments are processed securely by Razorpay. Prices include applicable taxes." },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `https://${APP_DOMAIN}`,
    description: "Instagram comment-to-DM automation for Indian creators.",
    offers: PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "INR" })),
  };

  return (
    <div className="bg-background text-zinc-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/60 bg-background/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label={APP_NAME} className="inline-flex items-center"><Logo className="h-8 w-auto" /></Link>
          <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
            <a href="#features" className="hover:text-zinc-900">Features</a>
            <a href="#how" className="hover:text-zinc-900">How it works</a>
            <a href="#pricing" className="hover:text-zinc-900">Pricing</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white sm:block">Log in</Link>
            <Link href="/register" className="inline-flex h-10 items-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700">Start free</Link>
            <LandingMenu />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
              <Sparkles className="h-3.5 w-3.5" /> Built for Indian creators · from ₹99/month
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Turn comments into DMs.
              <span className="block bg-gradient-to-r from-violet-600 via-violet-500 to-pink-500 bg-clip-text text-transparent">And DMs into sales.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-600">
              Someone comments your keyword on a Reel. {APP_NAME} instantly sends them a personal DM with your link. No copy-pasting, no missed leads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={primaryCta}>Start {TRIAL_DAYS}-day free trial <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/zeeshan?campaign=cmp_python" className={secondaryCta}>See a demo storefront</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-violet-600" /> Official Meta API</li>
              <li className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-violet-600" /> No password needed</li>
              <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-violet-600" /> Cancel any time</li>
            </ul>
          </div>

          <HeroPhone />
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <DashboardPreview />
      </section>

      {/* Made for strip */}
      <section className="mt-16 overflow-hidden border-y border-white/70 bg-white/50 py-5">
        <div className="flex w-max animate-marquee gap-10 pr-10">
          {[...niches, ...niches].map((n, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> {n}
            </span>
          ))}
        </div>
      </section>

      {/* Alternating feature rows */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 space-y-24 px-4 py-24 sm:px-6">
        <FeatureRow
          eyebrow="Comment to DM"
          title="Reply to every single comment, instantly"
          body="No more copy-pasting the same link 300 times. Set a keyword once and every person who comments it gets a personal DM."
          points={["Works on Reels and posts", "Personal message with their name", "Runs day and night"]}
          visual={<CommentsVisual />}
        />
        <FeatureRow
          reverse
          eyebrow="Creator storefront · Creator Plus"
          title="One storefront. Four links that actually work."
          body="Your DM points to a clean storefront with your profile, socials and links. Three stay fixed, and the fourth changes for every campaign."
          points={["Your own page at " + APP_DOMAIN + "/you", "A different fourth link per Reel", "Theme and button style you choose"]}
          visual={<StorefrontVisual />}
        />
        <FeatureRow
          eyebrow="Analytics"
          title="See exactly which Reel makes you money"
          body="Follow the whole funnel from comment to click. Compare campaigns, keywords and links over any date range."
          points={["Comments, DMs, visits and clicks", "Per campaign and per link", "Today, 7 days, 30 days or custom"]}
          visual={<FunnelVisual />}
        />
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <SectionHeading eyebrow="One platform" title="Everything you need to grow from DMs" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureGrid.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-white bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 flex items-center gap-2 font-semibold">
                {f.title}
                {"plus" in f && f.plus && <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-semibold text-pink-700">Creator Plus</span>}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 bg-white/60 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="How it works" title="Live in 3 minutes. No tech skills needed." />
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-violet-200 md:block" />
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-pink-300 text-xs font-bold text-pink-900">{i + 1}</span>
                </span>
                <h3 className="mt-5 font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/register" className={primaryCta}>Set up my first campaign <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-violet-950 py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight text-pink-300">{s.value}</p>
              <p className="mt-2 text-sm text-violet-200">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="Use cases" title="One keyword. A different win for every creator." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((u) => (
            <div key={u.who} className="flex flex-col rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600"><u.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-semibold">{u.who}</h3>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400">They comment</p>
              <p className="mt-1 inline-flex w-fit rounded-md bg-violet-50 px-2 py-0.5 font-mono text-sm font-semibold text-violet-700">{u.keyword}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400">They get</p>
              <p className="mt-1 text-sm text-zinc-600">{u.sends}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 bg-white/60 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow="Pricing" title="Simple pricing, made for India" subtitle={`Every plan starts with a ${TRIAL_DAYS}-day free trial.`} />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PLANS.map((plan) => {
              const featured = plan.id === "creator_plus";
              return (
                <div
                  key={plan.id}
                  className={featured
                    ? "relative flex flex-col rounded-3xl bg-violet-950 p-7 text-white shadow-xl"
                    : "relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-7"}
                >
                  {featured && <span className="absolute -top-3 right-7 rounded-full bg-pink-300 px-3 py-1 text-xs font-semibold text-pink-900">Most popular</span>}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className={featured ? "mt-1 text-sm text-violet-200" : "mt-1 text-sm text-zinc-500"}>{plan.tagline}</p>
                  <p className="mt-6">
                    <span className="text-5xl font-bold tracking-tight">₹{plan.price}</span>
                    <span className={featured ? "text-violet-200" : "text-zinc-500"}>/month</span>
                  </p>
                  <ul className="mt-7 space-y-3 text-sm">
                    {plan.features.filter((f) => !f.soon).map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5">
                        <Check className={featured ? "mt-0.5 h-4 w-4 shrink-0 text-pink-300" : "mt-0.5 h-4 w-4 shrink-0 text-violet-600"} />
                        <span>
                          {f.label}
                          {f.value !== "Included" && <span className={featured ? "text-violet-200" : "text-zinc-500"}> · {f.value}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className={featured ? "mt-6 text-xs font-semibold uppercase tracking-wide text-violet-300" : "mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-400"}>Coming soon</p>
                  <ul className="mb-8 mt-3 flex flex-wrap gap-2">
                    {plan.features.filter((f) => f.soon).map((f) => (
                      <li key={f.label} className={featured ? "rounded-full bg-white/10 px-2.5 py-1 text-xs text-violet-100" : "rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"}>{f.label}</li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={featured
                      ? "mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-violet-900 hover:bg-violet-50"
                      : "mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700"}
                  >
                    Start free trial
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">Prices include applicable taxes. Payments processed securely by Razorpay. Cancel any time.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Questions creators ask us" />
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-sm open:bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-pink-500 px-6 py-16 text-center text-white sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Your next Reel could bring 500 DMs.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-violet-100">Make sure every one of them gets your link, automatically.</p>
          <Link href="/register" className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-violet-900 hover:bg-violet-50">
            Start free for {TRIAL_DAYS} days <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/70 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <Link href="/" aria-label={APP_NAME} className="inline-flex items-center"><Logo className="h-8 w-auto" /></Link>
            <p className="mt-3 text-sm text-zinc-500">Instagram comment-to-DM automation for Indian creators.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 inline-block text-sm font-medium text-violet-700 hover:text-violet-800">{SUPPORT_EMAIL}</a>
          </div>
          <FooterCol title="Product" links={[["Features", "#features"], ["How it works", "#how"], ["Pricing", "#pricing"], ["Demo storefront", "/zeeshan?campaign=cmp_python"]]} />
          <FooterCol title="Account" links={[["Log in", "/login"], ["Start free trial", "/register"], ["Admin", "/admin/login"]]} />
          <FooterCol title="Legal" links={[["Privacy", "/privacy"], ["Terms", "/terms"], ["Data deletion", "/data-deletion"]]} />
        </div>
        <p className="border-t border-white/70 py-6 text-center text-xs text-zinc-500">© 2026 {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ---------- pieces ---------- */

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-zinc-600">{subtitle}</p>}
    </div>
  );
}

function FeatureRow({ eyebrow, title, body, points, visual, reverse }: {
  eyebrow: string; title: string; body: string; points: string[]; visual: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : undefined}>
        <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-4 text-zinc-600">{body}</p>
        <ul className="mt-6 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100"><Check className="h-3 w-3 text-violet-700" /></span>
              {p}
            </li>
          ))}
        </ul>
        <Link href="/register" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:gap-2.5 hover:text-violet-800">
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className={reverse ? "lg:order-1" : undefined}>{visual}</div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-zinc-500">
        {links.map(([label, href]) => (
          <li key={label}><Link href={href} className="hover:text-zinc-900">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- illustrations (pure UI, no real data) ---------- */

function HeroPhone() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[320px] lg:mt-0">
      <div className="animate-float absolute -left-14 top-16 z-10 hidden rounded-2xl bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:block">
        <span className="text-pink-500">⚡</span> DM sent in 4s
      </div>
      <div className="animate-float absolute -right-12 bottom-24 z-10 hidden rounded-2xl bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:block" style={{ animationDelay: "1.5s" }}>
        <MousePointerClick className="mr-1 inline h-3.5 w-3.5 text-violet-600" /> Link clicked
      </div>

      <div className="rounded-[2.6rem] border-[10px] border-zinc-900 bg-white shadow-2xl shadow-violet-900/20">
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-zinc-900" />
        <div className="space-y-3 p-4 pb-6">
          <div className="pop-in overflow-hidden rounded-2xl border border-zinc-100" style={{ animationDelay: "0.2s" }}>
            <div className="flex h-28 items-end bg-gradient-to-br from-violet-300 via-violet-200 to-pink-300 p-3">
              <span className="rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white">▶ Reel · Python in 60s</span>
            </div>
            <div className="p-3 text-xs">
              <span className="font-semibold">@priya.learns</span> PYTHON please!! 🙏
            </div>
          </div>

          <div className="pop-in flex justify-center" style={{ animationDelay: "0.9s" }}>
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-semibold text-pink-700">
              <Zap className="h-3 w-3" /> Keyword matched: PYTHON
            </span>
          </div>

          <div className="pop-in flex items-end gap-2" style={{ animationDelay: "1.5s" }}>
            <span className="brand-gradient h-6 w-6 shrink-0 rounded-full" />
            <div className="rounded-2xl rounded-bl-sm bg-violet-600 px-3 py-2 text-xs text-white">
              Hey Priya! 🙌 Thanks for commenting. Here is your free Python handbook 👇
            </div>
          </div>

          <div className="pop-in ml-8 rounded-2xl border border-violet-100 bg-violet-50 p-3" style={{ animationDelay: "2.1s" }}>
            <p className="text-[11px] font-semibold text-violet-900">Python Handbook (free)</p>
            <p className="text-[10px] text-violet-700">{APP_DOMAIN}/zeeshan</p>
            <span className="mt-2 flex h-7 items-center justify-center rounded-full bg-violet-600 text-[11px] font-semibold text-white">Open link</span>
          </div>

          <div className="pop-in flex justify-end" style={{ animationDelay: "2.7s" }}>
            <div className="rounded-2xl rounded-br-sm bg-zinc-100 px-3 py-2 text-xs">omg thank youuu 😍</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const bars = [35, 52, 44, 68, 58, 80, 72, 95, 84, 70, 88, 100];
  const cards = [
    { label: "Comments", value: "1,284", icon: MessageCircle },
    { label: "DMs sent", value: "1,271", icon: Send },
    { label: "Storefront visits", value: "842", icon: Store },
    { label: "Link clicks", value: "516", icon: MousePointerClick },
  ];
  return (
    <div className="rounded-3xl border border-white bg-white/70 p-2 shadow-2xl shadow-violet-900/10 backdrop-blur">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-pink-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
        <span className="ml-3 rounded-md bg-zinc-100 px-3 py-0.5 text-[11px] text-zinc-500">{APP_DOMAIN}/dashboard</span>
        <span className="ml-auto text-[11px] font-medium text-zinc-400">Product preview</span>
      </div>
      <div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:p-6 md:grid-cols-[1fr_1.4fr]">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl bg-white p-4 shadow-sm">
              <c.icon className="h-4 w-4 text-violet-600" />
              <p className="mt-3 text-2xl font-bold tracking-tight">{c.value}</p>
              <p className="text-xs text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Link clicks · last 12 days</p>
            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-semibold text-pink-700">+42%</span>
          </div>
          <div className="mt-6 flex h-40 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className={i === bars.length - 1 ? "flex-1 rounded-t-md bg-pink-300" : "flex-1 rounded-t-md bg-violet-300"} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsVisual() {
  const rows = [
    ["@rahul.codes", "PYTHON"],
    ["@sneha_k", "python 🔥"],
    ["@arjun.dev", "Python pls"],
    ["@meera.j", "PYTHON!!"],
  ];
  return (
    <div className="rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 p-6">
      <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Comments on your Reel</p>
        {rows.map(([user, text]) => (
          <div key={user} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm">
            <span className="truncate"><span className="font-semibold">{user}</span> {text}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
              <Check className="h-3 w-3" /> DM sent
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StorefrontVisual() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-pink-100 to-violet-100 p-6">
      <div className="mx-auto max-w-xs rounded-3xl bg-white p-6 text-center shadow-sm">
        <span className="brand-gradient mx-auto block h-16 w-16 rounded-full" />
        <p className="mt-3 font-semibold">Zeeshan</p>
        <p className="text-xs text-zinc-500">Learn Python in Hinglish</p>
        <div className="mt-5 space-y-2.5 text-sm font-medium">
          <div className="rounded-full border border-zinc-200 py-2.5">Free Python course</div>
          <div className="rounded-full border border-zinc-200 py-2.5">YouTube channel</div>
          <div className="rounded-full border border-zinc-200 py-2.5">1:1 mentorship</div>
          <div className="rounded-full bg-violet-600 py-2.5 text-white">⚡ This Reel: Python Handbook</div>
        </div>
      </div>
    </div>
  );
}

function FunnelVisual() {
  const steps = [
    { label: "Comments", value: "1,284", width: "100%" },
    { label: "DMs delivered", value: "1,271", width: "96%" },
    { label: "Storefront visits", value: "842", width: "66%" },
    { label: "Link clicks", value: "516", width: "40%" },
  ];
  return (
    <div className="rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 p-6">
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Campaign funnel · PYTHON</p>
        {steps.map((s, i) => (
          <div key={s.label}>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-zinc-100">
              <div className={i === steps.length - 1 ? "h-full rounded-full bg-pink-400" : "h-full rounded-full bg-violet-400"} style={{ width: s.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

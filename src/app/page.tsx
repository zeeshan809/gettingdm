import Link from "next/link";
import { ArrowRight, BarChart3, Check, MessageCircle, Store, Zap } from "lucide-react";
import { APP_DOMAIN, APP_NAME, PLANS, TRIAL_DAYS } from "@/lib/config";
import { LinkButton } from "@/components/ui";

const features = [
  { icon: MessageCircle, title: "Comment-to-DM automation", body: "Someone comments your keyword on a Reel — they get your link in their DMs within seconds. Uses Meta's official API." },
  { icon: Store, title: "One storefront, four links", body: "Three permanent links you control in one place, plus a fourth link that changes for every campaign." },
  { icon: BarChart3, title: "Know what converts", body: "See comments, DMs delivered, storefront visits and link clicks for every Reel you run." },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white"><Zap className="h-4 w-4" /></span>
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <a href="#pricing" className="hidden px-3 text-sm text-zinc-600 hover:text-zinc-900 sm:block">Pricing</a>
          <LinkButton href="/login" variant="ghost">Log in</LinkButton>
          <LinkButton href="/register">Start free trial</LinkButton>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <p className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">Built for Indian creators · from ₹99/month</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Turn every comment into a DM — and every DM into a click.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-zinc-600">
            Automatically reply to keyword comments on your Reels and send followers to a storefront with all your links.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/register" size="lg">Start {TRIAL_DAYS}-day free trial <ArrowRight className="h-4 w-4" /></LinkButton>
            <LinkButton href="/zeeshan?campaign=cmp_python" size="lg" variant="secondary">See a demo storefront</LinkButton>
          </div>
        </div>

        {/* Product illustration: a comment triggering a DM */}
        <div className="mt-14 lg:mt-0">
          <div className="mx-auto max-w-sm space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <p className="text-xs font-semibold text-zinc-500">Comment on your Reel</p>
              <p className="mt-1"><span className="font-semibold">@priya.learns</span> PYTHON please!! 🙏</p>
            </div>
            <div className="flex justify-center text-violet-600"><Zap className="h-5 w-5" /></div>
            <div className="ml-6 rounded-2xl rounded-tr-sm bg-violet-600 p-3 text-sm text-white shadow-sm">
              Hey Priya! Thanks for commenting 🙌 Here&apos;s your Python Handbook:
              <span className="mt-1 block font-medium underline">{APP_DOMAIN}/zeeshan?campaign=…</span>
            </div>
            <p className="text-center text-xs text-zinc-400">Sent automatically in 4 seconds</p>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-zinc-50/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Simple pricing</h2>
        <p className="mt-2 text-center text-zinc-600">Every plan starts with a {TRIAL_DAYS}-day free trial.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const featured = plan.id === "creator_plus";
            return (
              <div key={plan.id} className={featured ? "rounded-2xl border-2 border-violet-600 p-6" : "rounded-2xl border border-zinc-200 p-6"}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {featured && <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">Most popular</span>}
                </div>
                <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
                <p className="mt-5"><span className="text-4xl font-semibold">₹{plan.price}</span><span className="text-zinc-500">/month</span></p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                      <span>{f.label}{f.value !== "Included" && <span className="text-zinc-500"> — {f.value}</span>}</span>
                    </li>
                  ))}
                </ul>
                <LinkButton href="/register" variant={featured ? "primary" : "secondary"} className="mt-6 w-full">Start free trial</LinkButton>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">Prices include applicable taxes. Payments processed securely by Razorpay. Cancel any time.</p>
      </section>

      <footer className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 {APP_NAME}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-zinc-800">Privacy</a>
            <a href="#" className="hover:text-zinc-800">Terms</a>
            <Link href="/admin/login" className="hover:text-zinc-800">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

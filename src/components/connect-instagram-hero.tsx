import { BarChart3, Instagram, Link2, Lock, MessageCircle, Send } from "lucide-react";
import { APP_DOMAIN } from "@/lib/config";
import { cn } from "./ui";

const benefits = [
  { icon: MessageCircle, title: "Auto-reply to comments", text: "Someone comments your keyword, they get your DM in seconds." },
  { icon: Link2, title: "Your link storefront", text: "Every DM links to your page with the exact resource they asked for." },
  { icon: BarChart3, title: "See what converts", text: "Track comments, DMs and link clicks for every Reel." },
];

// Full-width "connect your Instagram" screen shown until an account is connected.
export function ConnectInstagramHero({ connectHref, disabled }: { connectHref: string; disabled?: boolean }) {
  return (
    <div className="grid items-center gap-10 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-10 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          <Instagram className="h-3.5 w-3.5" /> Step 1 of 3
        </span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Connect your Instagram to start auto-replying</h2>
        <p className="mt-3 text-zinc-600">Link your professional account once. Then every comment with your keyword gets a DM with your link, day and night.</p>

        <ul className="mt-7 space-y-4">
          {benefits.map((b) => (
            <li key={b.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><b.icon className="h-4.5 w-4.5" /></span>
              <div>
                <p className="font-medium text-zinc-900">{b.title}</p>
                <p className="text-sm text-zinc-500">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Full page load on purpose: the route redirects off-site to Meta. */}
        <a
          href={disabled ? undefined : connectHref}
          aria-disabled={disabled}
          className={cn(
            "mt-8 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition-transform sm:w-auto sm:px-10",
            "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500",
            disabled ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5",
          )}
        >
          <Instagram className="h-5 w-5" /> Connect Instagram
        </a>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
          <Lock className="h-3.5 w-3.5" /> Secured by Meta&apos;s official login. We never see your password.
        </p>

        <details className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <summary className="cursor-pointer font-medium text-zinc-800">What do I need?</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>An Instagram <strong>Business or Creator</strong> account. Switch for free in Instagram: Settings → Account type and tools → Switch to professional account.</li>
            <li>You can log in with Instagram or Facebook. Meta may ask you to choose or create a business portfolio, which takes a few seconds.</li>
            <li>On Meta&apos;s screen, select your Instagram account and allow all permissions.</li>
          </ul>
        </details>
      </div>

      {/* Illustration: comment → DM → storefront link. Decorative only. */}
      <div aria-hidden className="relative mx-auto w-full max-w-sm">
        <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-violet-100 via-fuchsia-50 to-orange-50" />
        <div className="rounded-[2.5rem] border-[10px] border-zinc-900 bg-white p-4 shadow-2xl">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-zinc-200" />
          <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-orange-300" />
          <div className="mt-3 flex items-start gap-2">
            <span className="h-7 w-7 shrink-0 rounded-full bg-sky-200" />
            <p className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-xs"><span className="font-semibold">priya.learns</span> PYTHON 🙏</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
            <Send className="h-3 w-3" /> GettingDM replied in 2s
          </div>
          <div className="ml-6 mt-2 rounded-2xl rounded-tr-sm bg-violet-600 px-3 py-2 text-xs text-white">
            Hey Priya! Here&apos;s the Python handbook you asked for 👇
            <span className="mt-1 block truncate underline opacity-90">{APP_DOMAIN}/yourname</span>
          </div>
          <div className="ml-6 mt-2 rounded-xl border border-zinc-200 py-2 text-center text-xs font-medium text-violet-700">Open the link</div>
        </div>
      </div>
    </div>
  );
}

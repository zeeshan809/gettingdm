import { ArrowUpRight, Sparkles } from "lucide-react";
import { avatarHue, type FeaturedLink, type FourthLink, type StoreLink, type StoreProfile } from "@/lib/storefront";
import { APP_NAME } from "@/lib/config";
import { Avatar, cn } from "./ui";

// Presentational only: used by the public storefront page and the editor's live preview.
// `hrefFor` routes clicks through the tracking redirect on the live page; the
// editor preview links straight to the destination.
export function StorefrontView({
  profile,
  featured,
  fourth,
  compact,
  hrefFor,
}: {
  profile: StoreProfile;
  featured: FeaturedLink[];
  fourth: FourthLink | null;
  compact?: boolean;
  hrefFor?: (slot: number) => string;
}) {
  const { brand, button, style } = profile.theme;
  const { avatarUrl, coverUrl } = profile;
  const dark = style === "dark";
  const radius = { pill: "rounded-full", rounded: "rounded-xl", square: "rounded-none" }[button];

  const linkCard = (link: StoreLink, slot: number, highlight: boolean) => (
    <a
      key={slot}
      href={hrefFor ? hrefFor(slot) : link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-3 border px-4 py-3.5 transition-transform hover:-translate-y-0.5",
        radius,
        dark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white shadow-sm",
      )}
      style={highlight ? { borderColor: brand, boxShadow: `0 0 0 1px ${brand}` } : undefined}
    >
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-semibold">{link.title}</p>
        {link.description && <p className={cn("truncate text-xs", dark ? "text-white/60" : "text-zinc-500")}>{link.description}</p>}
      </div>
      <span className={cn("inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white", radius)} style={{ background: brand }}>
        {link.buttonLabel}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );

  return (
    <div className={cn(compact ? "min-h-full" : "min-h-screen", dark ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900")}>
      <div
        className={cn("w-full bg-cover bg-center", compact ? "h-24" : "h-36 sm:h-44")}
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : { background: `linear-gradient(135deg, ${brand}, #8db9f0 55%, #f5b69e)` }}
      />
      <div className={cn("mx-auto max-w-md px-5 pb-10", compact ? "-mt-10" : "-mt-14")}>
        <div className="flex flex-col items-center text-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className={cn("rounded-full object-cover ring-4", dark ? "ring-zinc-950" : "ring-zinc-50")} style={{ width: compact ? 80 : 104, height: compact ? 80 : 104 }} />
          ) : (
            <Avatar name={profile.name} hue={avatarHue(profile.username)} size={compact ? 80 : 104} className={cn("ring-4", dark ? "ring-zinc-950" : "ring-zinc-50")} />
          )}
          <h1 className="mt-3 text-xl font-bold">{profile.name}</h1>
          <p className={cn("text-sm", dark ? "text-white/60" : "text-zinc-500")}>@{profile.username}</p>
          {profile.bio && <p className={cn("mt-3 text-sm", dark ? "text-white/80" : "text-zinc-700")}>{profile.bio}</p>}
          {profile.socials.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {profile.socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={cn("rounded-full px-3 py-1 text-xs font-medium", dark ? "bg-white/10" : "bg-white shadow-sm ring-1 ring-zinc-200")}>
                  {s.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-7 space-y-3">
          {fourth && (
            <div>
              {fourth.source === "campaign" && (
                <p className="mb-1.5 flex items-center justify-center gap-1 text-xs font-semibold" style={{ color: brand }}>
                  <Sparkles className="h-3.5 w-3.5" /> The resource you asked for
                </p>
              )}
              {linkCard(fourth, 4, fourth.source === "campaign")}
            </div>
          )}
          {featured.map((l) => linkCard(l, l.position, false))}
        </div>

        <p className={cn("mt-10 text-center text-xs", dark ? "text-white/40" : "text-zinc-400")}>Made with {APP_NAME}</p>
      </div>
    </div>
  );
}

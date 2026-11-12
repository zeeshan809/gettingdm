"use client";

import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ResolvedRange } from "@/lib/date-range";
import { RANGE_OPTIONS } from "./interactive";
import { cn, Input } from "./ui";

const short = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

// URL-driven range picker: the server page reads ?range=&from=&to= and refetches.
export function RangeFilter({ range }: { range: ResolvedRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const go = (params: Record<string, string>) => {
    setOpen(false);
    startTransition(() => router.replace(`${pathname}?${new URLSearchParams(params)}`, { scroll: false }));
  };

  const toggle = () => {
    if (!open) { setFrom(range.from); setTo(range.to); setShowCustom(range.id === "custom"); }
    setOpen(!open);
  };

  const label = range.id === "custom"
    ? `${short(range.from)} to ${short(range.to)}`
    : RANGE_OPTIONS.find((o) => o.id === range.id)?.label ?? "Last 30 days";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-violet-300",
          pending && "opacity-60",
        )}
      >
        <CalendarDays className="h-4 w-4 text-violet-600" />
        {label}
        <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 z-30 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg sm:left-auto sm:right-0">
          {RANGE_OPTIONS.filter((o) => o.id !== "custom").map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitemradio"
              aria-checked={range.id === o.id}
              onClick={() => go({ range: o.id })}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
                range.id === o.id ? "bg-violet-50 font-medium text-violet-700" : "text-zinc-700 hover:bg-zinc-50",
              )}
            >
              {o.label}
              {range.id === o.id && <Check className="h-4 w-4" />}
            </button>
          ))}

          <div className="my-1 border-t border-zinc-100" />
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm",
              range.id === "custom" ? "font-medium text-violet-700" : "text-zinc-700 hover:bg-zinc-50",
            )}
          >
            Custom range
            <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition", showCustom && "rotate-180")} />
          </button>

          {showCustom && (
            <div className="space-y-2 px-3 pb-2 pt-1">
              <label className="block text-xs text-zinc-500">
                From
                <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full" />
              </label>
              <label className="block text-xs text-zinc-500">
                To
                <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full" />
              </label>
              <button
                type="button"
                disabled={!from || !to || from > to}
                onClick={() => go({ range: "custom", from, to })}
                className="mt-1 h-9 w-full rounded-lg bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

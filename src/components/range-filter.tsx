"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ResolvedRange } from "@/lib/date-range";
import { RANGE_OPTIONS } from "./interactive";
import { cn, Input } from "./ui";

// URL-driven range picker: the server page reads ?range=&from=&to= and refetches.
export function RangeFilter({ range }: { range: ResolvedRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const go = (params: Record<string, string>) =>
    startTransition(() => router.replace(`${pathname}?${new URLSearchParams(params)}`, { scroll: false }));

  return (
    <div className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
      <div className="flex flex-wrap rounded-lg border border-zinc-200 bg-white p-0.5">
        {RANGE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => go(o.id === "custom" ? { range: "custom", from: range.from, to: range.to } : { range: o.id })}
            className={cn("rounded-md px-2.5 py-1 text-xs font-medium", range.id === o.id ? "bg-violet-600 text-white" : "text-zinc-600 hover:bg-zinc-100")}
          >
            {o.label}
          </button>
        ))}
      </div>
      {range.id === "custom" && (
        <div className="flex items-center gap-1.5">
          <Input type="date" value={range.from} max={range.to} onChange={(e) => e.target.value && go({ range: "custom", from: e.target.value, to: range.to })} className="h-8 w-auto text-xs" aria-label="From date" />
          <span className="text-xs text-zinc-400">to</span>
          <Input type="date" value={range.to} min={range.from} onChange={(e) => e.target.value && go({ range: "custom", from: range.from, to: e.target.value })} className="h-8 w-auto text-xs" aria-label="To date" />
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

// Mobile-only menu for the landing page header.
export function LandingMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-white"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-zinc-200 bg-background/95 px-4 pb-5 pt-2 shadow-lg backdrop-blur-md">
          <nav className="flex flex-col">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-zinc-800 hover:bg-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-800">Log in</Link>
            <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">Start free</Link>
          </div>
        </div>
      )}
    </div>
  );
}

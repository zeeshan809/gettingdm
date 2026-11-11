import Link from "next/link";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";
import { APP_NAME, LEGAL_UPDATED } from "@/lib/config";

// Shared shell for the privacy policy, terms and data-deletion pages.
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="brand-gradient flex h-7 w-7 items-center justify-center rounded-lg text-white"><Zap className="h-4 w-4" /></span>
            <span className="font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {LEGAL_UPDATED}</p>
        <div className="legal mt-8 space-y-4 text-[15px] leading-7 text-zinc-700 [&_a]:text-violet-700 [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_strong]:text-zinc-900">
          {children}
        </div>
      </main>
      <footer className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-5 px-4 py-6 text-sm text-zinc-500 sm:px-6">
          <span>© 2026 {APP_NAME}</span>
          <Link href="/privacy" className="hover:text-zinc-800">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-800">Terms</Link>
          <Link href="/data-deletion" className="hover:text-zinc-800">Data deletion</Link>
        </div>
      </footer>
    </div>
  );
}

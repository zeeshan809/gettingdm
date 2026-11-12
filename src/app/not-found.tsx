import Link from "next/link";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui";
import { APP_NAME } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Link href="/" aria-label={APP_NAME} className="mb-10"><Logo className="h-9 w-auto" /></Link>
      <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">This page slipped out of the DMs</h1>
      <p className="mt-3 max-w-sm text-zinc-500">The storefront or page you are looking for doesn&apos;t exist, or the link has changed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/" size="lg">Go home</LinkButton>
        <LinkButton href="/dashboard" size="lg" variant="secondary">Open dashboard</LinkButton>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button, LinkButton } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-10 h-9 w-auto" />
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-zinc-500">A hiccup on our side. Try again, and if it keeps happening, write to support.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>Try again</Button>
        <LinkButton href="/" size="lg" variant="secondary">Go home</LinkButton>
      </div>
    </div>
  );
}

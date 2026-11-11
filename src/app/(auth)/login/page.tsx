"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "link") setError("That link is invalid or has expired. Please try again.");
    if (code === "account") setError("Your session has ended. Please log in again.");
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setBusy(false);
      setError(error.code === "email_not_confirmed" ? "Please verify your email first. Check your inbox for the link." : "Incorrect email or password.");
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-zinc-500">Log in to manage your campaigns and storefront.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-800">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-violet-700 hover:underline">Forgot password?</Link>
          </div>
          <Input name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Logging in…" : "Log in"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        New here? <Link href="/register" className="font-medium text-violet-700 hover:underline">Start your 30-day free trial</Link>
      </p>
    </>
  );
}

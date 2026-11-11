"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.resetPasswordForEmail(String(new FormData(e.currentTarget).get("email")), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    // Don't reveal whether the account exists; only surface rate limiting.
    if (error?.code === "over_email_send_rate_limit") {
      setError("Too many requests. Please wait a minute and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto h-10 w-10 text-violet-600" />
        <h1 className="mt-3 text-xl font-semibold">Check your inbox</h1>
        <p className="mt-1 text-sm text-zinc-500">If an account exists for that email, we&apos;ve sent a reset link. It expires in 1 hour.</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-violet-700 hover:underline">Back to log in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-zinc-500">Enter your account email and we&apos;ll send you a reset link.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-violet-700 hover:underline">Back to log in</Link>
      </p>
    </>
  );
}

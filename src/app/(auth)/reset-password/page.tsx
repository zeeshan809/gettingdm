"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

// Reached from the reset email via /auth/callback, which signs the user in first.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== form.get("confirm")) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(
        error.code === "same_password" ? "Choose a password different from your current one."
          : error.name === "AuthSessionMissingError" ? "This reset link has expired. Request a new one."
          : error.message,
      );
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        <Field label="New password" help="At least 8 characters.">
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password">
          <Input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
      </form>
    </>
  );
}

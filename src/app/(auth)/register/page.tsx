"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { APP_DOMAIN, RESERVED_USERNAMES, TRIAL_DAYS } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [taken, setTaken] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const clean = username.toLowerCase().replace(/[^a-z0-9_.]/g, "");
  const reserved = RESERVED_USERNAMES.includes(clean);
  const valid = USERNAME_RE.test(clean) && !reserved;

  useEffect(() => {
    setTaken(false);
    if (!valid) return;
    const t = setTimeout(async () => {
      const { data } = await createClient().rpc("username_available", { u: clean });
      setTaken(data === false);
    }, 400);
    return () => clearTimeout(t);
  }, [clean, valid]);

  const usernameHelp = reserved
    ? "This username is reserved."
    : taken
      ? "This username is already taken."
      : clean && !valid
        ? "3–30 characters: letters, numbers, dots and underscores."
        : `${APP_DOMAIN}/${clean || "yourname"}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setBusy(true);
    setError("");

    const supabase = createClient();
    const { data: available } = await supabase.rpc("username_available", { u: clean });
    if (!available) {
      setTaken(true);
      setBusy(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        data: { full_name: String(form.get("full_name")).trim(), username: clean },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setBusy(false);

    if (error) {
      setError(error.code === "weak_password" ? "Please choose a stronger password." : error.message);
      return;
    }
    // Supabase hides existing accounts by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      setError("An account with this email already exists. Try logging in.");
      return;
    }
    if (data.session) {
      router.replace("/onboarding");
      router.refresh();
      return;
    }
    sessionStorage.setItem("pending-email", email);
    router.push("/verify-email");
  }

  return (
    <>
      <h1 className="text-xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-zinc-500">{TRIAL_DAYS}-day free trial. No card needed to start.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        <Field label="Full name">
          <Input name="full_name" required maxLength={80} autoComplete="name" placeholder="Zeeshan Hussain" />
        </Field>
        <Field label="Storefront username" help={usernameHelp}>
          <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" aria-invalid={reserved || taken} />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Field label="Password" help="At least 8 characters.">
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-2 text-xs text-zinc-500">
          <input type="checkbox" required className="mt-0.5 accent-violet-600" />
          <span>
            I agree to the <a href="/terms" target="_blank" className="text-violet-700 underline">Terms of Service</a> and{" "}
            <a href="/privacy" target="_blank" className="text-violet-700 underline">Privacy Policy</a>.
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={!valid || taken || busy}>{busy ? "Creating account…" : "Create account"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account? <Link href="/login" className="font-medium text-violet-700 hover:underline">Log in</Link>
      </p>
    </>
  );
}

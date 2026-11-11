"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { Button, Field, FormError, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setBusy(false);
      setError("Incorrect email or password.");
      return;
    }

    const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle();
    if (!admin) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("This account doesn't have admin access.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-violet-600" />
          <p className="font-semibold">{APP_NAME} Admin</p>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Restricted to authorised platform staff.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <FormError>{error}</FormError>
          <Field label="Work email"><Input name="email" type="email" required autoComplete="username" /></Field>
          <Field label="Password"><Input name="password" type="password" required autoComplete="current-password" /></Field>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      </div>
    </div>
  );
}

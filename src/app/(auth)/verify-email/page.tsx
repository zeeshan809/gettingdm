"use client";

import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { FormError, LinkButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => setEmail(sessionStorage.getItem("pending-email") ?? ""), []);

  async function resend() {
    setStatus("sending");
    setError("");
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) {
      setError(error.code === "over_email_send_rate_limit" ? "Please wait a minute before requesting another email." : error.message);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="text-center">
      <MailCheck className="mx-auto h-10 w-10 text-violet-600" />
      <h1 className="mt-3 text-xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-zinc-500">
        We sent a verification link to {email ? <span className="font-medium text-zinc-800">{email}</span> : "your inbox"}. Click it to
        activate your account. Your 30-day free trial starts once your email is verified.
      </p>
      <div className="mt-4 text-left"><FormError>{error}</FormError></div>
      <LinkButton href="/login" className="mt-6 w-full">Back to log in</LinkButton>
      {email && (
        <button type="button" onClick={resend} disabled={status !== "idle"} className="mt-3 text-sm font-medium text-violet-700 hover:underline disabled:text-zinc-400 disabled:no-underline">
          {status === "sent" ? "Email sent" : status === "sending" ? "Sending…" : "Resend email"}
        </button>
      )}
    </div>
  );
}

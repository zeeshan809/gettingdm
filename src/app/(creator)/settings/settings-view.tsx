"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Modal, Toggle, useToast } from "@/components/interactive";
import { Button, Card, CardHeader, Field, FormError, Input, PageHeader } from "@/components/ui";
import { EMAIL_PREF_KEYS, EMAIL_PREF_LABELS, type EmailPrefs } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount, saveEmailPrefs, updateName } from "./actions";

export function SettingsView({ username, name, email, prefs: initialPrefs }: { username: string; name: string; email: string; prefs: EmailPrefs }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [accountError, setAccountError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [prefs, setPrefs] = useState(initialPrefs);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function saveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newName = String(form.get("name"));
    const newEmail = String(form.get("email")).trim().toLowerCase();
    setAccountError("");
    startTransition(async () => {
      if (newName !== name) {
        const r = await updateName(newName);
        if ("error" in r) return setAccountError(r.error);
      }
      if (newEmail !== email) {
        const { data, error } = await createClient().auth.updateUser({ email: newEmail });
        if (error) {
          return setAccountError(error.code === "email_exists" ? "Another account already uses that email." : error.message);
        }
        toast(data.user?.email === newEmail ? "Account updated" : `Check ${newEmail} to confirm the change`);
      } else {
        toast("Account updated");
      }
      router.refresh();
    });
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const next = String(form.get("new"));
    if (next !== form.get("confirm")) return setPasswordError("New passwords don't match.");
    setPasswordError("");
    setPasswordBusy(true);
    const supabase = createClient();
    // Re-check the current password before allowing a change.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: String(form.get("current")) });
    if (authError) {
      setPasswordBusy(false);
      return setPasswordError("Your current password is incorrect.");
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setPasswordBusy(false);
    if (error) {
      return setPasswordError(
        error.code === "same_password" ? "Choose a password different from your current one."
          : error.code === "weak_password" ? "Please choose a stronger password."
          : error.message,
      );
    }
    formEl.reset();
    toast("Password changed");
  }

  function togglePref(key: keyof EmailPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    startTransition(async () => {
      const r = await saveEmailPrefs(next);
      if ("error" in r) {
        setPrefs(prefs);
        toast(r.error);
      }
    });
  }

  function confirmDelete() {
    setDeleteError("");
    startTransition(async () => {
      const r = await deleteAccount(confirmText);
      // Success redirects; we only get here on failure.
      if (r && "error" in r) setDeleteError(r.error);
    });
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Account" />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={saveAccount}>
            <div className="sm:col-span-2"><FormError>{accountError}</FormError></div>
            <Field label="Full name"><Input name="name" required maxLength={80} defaultValue={name} /></Field>
            <Field label="Email" help="Used to log in."><Input name="email" type="email" required defaultValue={email} /></Field>
            <div className="sm:col-span-2"><Button type="submit" disabled={pending}>Save</Button></div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Password" />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={changePassword}>
            <div className="sm:col-span-2"><FormError>{passwordError}</FormError></div>
            <div className="sm:col-span-2"><Field label="Current password"><Input name="current" type="password" required autoComplete="current-password" /></Field></div>
            <Field label="New password" help="At least 8 characters."><Input name="new" type="password" required minLength={8} autoComplete="new-password" /></Field>
            <Field label="Confirm new password"><Input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></Field>
            <div className="sm:col-span-2"><Button type="submit" disabled={passwordBusy}>{passwordBusy ? "Changing…" : "Change password"}</Button></div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Email notifications" description="Choose which emails we send you. Saved automatically." />
          <ul className="divide-y divide-zinc-100">
            {EMAIL_PREF_KEYS.map((k) => (
              <li key={k} className="flex items-center justify-between px-5 py-3 text-sm">
                {EMAIL_PREF_LABELS[k]}
                <Toggle checked={prefs[k]} onChange={(v) => togglePref(k, v)} label={EMAIL_PREF_LABELS[k]} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-red-200">
          <CardHeader title="Delete account" description="Permanently delete your account, campaigns, storefront and analytics." />
          <div className="p-5">
            <Button variant="danger-outline" onClick={() => setDeleting(true)}>Delete my account</Button>
          </div>
        </Card>
      </div>

      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Delete account"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleting(false)}>Cancel</Button>
          <Button variant="danger" disabled={confirmText.trim().toLowerCase() !== username || pending} onClick={confirmDelete}>
            {pending ? "Deleting…" : "Delete account"}
          </Button>
        </>}
      >
        <div className="space-y-3">
          <FormError>{deleteError}</FormError>
          <p>This immediately deletes your account, storefront, campaigns and all analytics. Your storefront link will stop working. This can&apos;t be undone.</p>
          <Field label={`Type ${username} to confirm`}>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-1" />
          </Field>
        </div>
      </Modal>
    </>
  );
}

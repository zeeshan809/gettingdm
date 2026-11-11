"use client";

import { useState } from "react";
import { Modal, Toggle, useToast } from "@/components/interactive";
import { Button, Card, CardHeader, Field, Input, PageHeader } from "@/components/ui";
import { currentCreator } from "@/lib/mock-data";

const emailPrefs = [
  { id: "failures", label: "Automation failures", on: true },
  { id: "trial", label: "Trial and billing reminders", on: true },
  { id: "connection", label: "Instagram connection issues", on: true },
  { id: "weekly", label: "Weekly performance summary", on: false },
];

export default function SettingsPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState(emailPrefs);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <>
      <PageHeader title="Settings" />
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Account" />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast("Account updated"); }}>
            <Field label="Full name"><Input defaultValue={currentCreator.name} /></Field>
            <Field label="Email" help="Verified"><Input type="email" defaultValue={currentCreator.email} /></Field>
            <div className="sm:col-span-2"><Button type="submit">Save</Button></div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Password" />
          <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast("Password changed"); }}>
            <div className="sm:col-span-2"><Field label="Current password"><Input type="password" autoComplete="current-password" /></Field></div>
            <Field label="New password"><Input type="password" minLength={8} autoComplete="new-password" /></Field>
            <Field label="Confirm new password"><Input type="password" minLength={8} autoComplete="new-password" /></Field>
            <div className="sm:col-span-2"><Button type="submit">Change password</Button></div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Email notifications" />
          <ul className="divide-y divide-zinc-100">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                {p.label}
                <Toggle checked={p.on} onChange={(v) => setPrefs(prefs.map((x) => (x.id === p.id ? { ...x, on: v } : x)))} label={p.label} />
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
          <Button variant="danger" disabled={confirmText !== currentCreator.username} onClick={() => { setDeleting(false); toast("Deletion requested"); }}>Delete account</Button>
        </>}
      >
        <p>This disconnects Instagram, cancels your subscription and deletes your data within 30 days. This can&apos;t be undone.</p>
        <Field label={`Type ${currentCreator.username} to confirm`}>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-1" />
        </Field>
      </Modal>
    </>
  );
}

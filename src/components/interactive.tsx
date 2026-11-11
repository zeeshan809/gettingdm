"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button, cn, Input } from "./ui";

// ---------- Toast ----------

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2800);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <ToastContext.Provider value={setMessage}>
      {children}
      {message && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ---------- Toggle ----------

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors", checked ? "bg-violet-600" : "bg-zinc-300")}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4.5" : "translate-x-0.5")} />
    </button>
  );
}

// ---------- Tabs ----------

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            value === t.id ? "border-violet-600 text-violet-700" : "border-transparent text-zinc-500 hover:text-zinc-800",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Date range filter (PRD 4.2) ----------

export type RangeId = "today" | "7d" | "30d" | "month" | "prev_month" | "custom";

export const RANGE_OPTIONS: { id: RangeId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "prev_month", label: "Previous month" },
  { id: "custom", label: "Custom" },
];

export function DateRangeFilter({ value, onChange }: { value: RangeId; onChange: (v: RangeId) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap rounded-lg border border-zinc-200 bg-white p-0.5">
        {RANGE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn("rounded-md px-2.5 py-1 text-xs font-medium", value === o.id ? "bg-violet-600 text-white" : "text-zinc-600 hover:bg-zinc-100")}
          >
            {o.label}
          </button>
        ))}
      </div>
      {value === "custom" && (
        <div className="flex items-center gap-1.5">
          <Input type="date" defaultValue="2026-10-01" className="h-8 w-auto text-xs" aria-label="From date" />
          <span className="text-xs text-zinc-400">to</span>
          <Input type="date" defaultValue="2026-11-10" className="h-8 w-auto text-xs" aria-label="To date" />
        </div>
      )}
    </div>
  );
}

// Number of trailing days of the mock series each range shows.
export function rangeDays(range: RangeId) {
  return { today: 1, "7d": 7, "30d": 30, month: 10, prev_month: 31, custom: 41 }[range];
}

// ---------- Audited admin action (button → reason → confirm) ----------

export function AuditedAction({ label, title, description, confirmLabel, danger, size = "sm" }: { label: string; title: string; description: string; confirmLabel: string; danger?: boolean; size?: "sm" | "md" }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const close = () => { setOpen(false); setReason(""); };
  return (
    <>
      <Button size={size} variant={danger ? "danger-outline" : "secondary"} onClick={() => setOpen(true)}>{label}</Button>
      <Modal
        open={open}
        onClose={close}
        title={title}
        footer={<>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} disabled={!reason.trim()} onClick={() => { close(); toast(`${confirmLabel} — recorded in audit log`); }}>{confirmLabel}</Button>
        </>}
      >
        <p>{description}</p>
        <label className="mt-4 block text-sm font-medium text-zinc-800">Reason (required, saved to audit log)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
      </Modal>
    </>
  );
}

// ---------- Modal ----------

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const onKey = useCallback((e: KeyboardEvent) => e.key === "Escape" && onClose(), [onClose]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onKey]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-400 hover:bg-zinc-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-600">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export const EMAIL_PREF_KEYS = ["failures", "trial", "connection", "weekly"] as const;
export type EmailPrefs = Record<(typeof EMAIL_PREF_KEYS)[number], boolean>;

export const EMAIL_PREF_LABELS: Record<keyof EmailPrefs, string> = {
  failures: "Automation failures",
  trial: "Trial and billing reminders",
  connection: "Instagram connection issues",
  weekly: "Weekly performance summary",
};

const DEFAULTS: EmailPrefs = { failures: true, trial: true, connection: true, weekly: false };

export function parseEmailPrefs(value: unknown): EmailPrefs {
  const v = (value ?? {}) as Partial<Record<string, unknown>>;
  return Object.fromEntries(EMAIL_PREF_KEYS.map((k) => [k, typeof v[k] === "boolean" ? v[k] : DEFAULTS[k]])) as EmailPrefs;
}

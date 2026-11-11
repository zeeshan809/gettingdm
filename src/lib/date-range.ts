// Turns a range picked in the UI (?range=…&from=…&to=…) into inclusive IST
// calendar dates, plus the equally long period just before it for deltas.
export type RangeId = "today" | "7d" | "30d" | "month" | "prev_month" | "custom";

export type ResolvedRange = {
  id: RangeId;
  from: string; // YYYY-MM-DD, inclusive
  to: string;
  prevFrom: string;
  prevTo: string;
  days: number;
};

const RANGE_IDS: RangeId[] = ["today", "7d", "30d", "month", "prev_month", "custom"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 366;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const diffDays = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export function todayIST(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function resolveRange(params: { range?: string; from?: string; to?: string }, now = new Date()): ResolvedRange {
  const today = todayIST(now);
  const id = RANGE_IDS.includes(params.range as RangeId) ? (params.range as RangeId) : "30d";
  let from: string;
  let to = today;

  switch (id) {
    case "today": from = today; break;
    case "7d": from = addDays(today, -6); break;
    case "month": from = `${today.slice(0, 8)}01`; break;
    case "prev_month": {
      to = addDays(`${today.slice(0, 8)}01`, -1);
      from = `${to.slice(0, 8)}01`;
      break;
    }
    case "custom": {
      const f = DATE_RE.test(params.from ?? "") ? params.from! : addDays(today, -29);
      const t = DATE_RE.test(params.to ?? "") ? params.to! : today;
      [from, to] = f <= t ? [f, t] : [t, f];
      if (to > today) to = today;
      if (diffDays(from, to) >= MAX_DAYS) from = addDays(to, -(MAX_DAYS - 1));
      break;
    }
    default: from = addDays(today, -29);
  }

  const days = diffDays(from, to) + 1;
  return { id, from, to, prevTo: addDays(from, -1), prevFrom: addDays(from, -days), days };
}

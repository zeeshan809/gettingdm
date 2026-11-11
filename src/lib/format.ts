const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const numFormatter = new Intl.NumberFormat("en-IN");

export const inr = (n: number) => inrFormatter.format(n);
export const num = (n: number) => numFormatter.format(n);
export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

// Pinned to IST so server and browser render the same text.
const TZ = "Asia/Kolkata";

export function date(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.ceil((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

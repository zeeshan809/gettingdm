import Link from "next/link";
import clsx from "clsx";
import { Inbox } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { AutomationStatus, ConnectionStatus, SubscriptionStatus, TicketStatus } from "@/lib/mock-data";
import { mediaHue } from "@/lib/campaigns";

export const cn = clsx;

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(23,42,71,0.04),0_4px_16px_-8px_rgba(23,42,71,0.08)]", className)}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const buttonStyles = {
  primary: "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700",
  secondary: "border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-700",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  "danger-outline": "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};
const buttonSizes = { sm: "h-8 rounded-lg px-3 text-xs", md: "h-10 rounded-xl px-4 text-sm", lg: "h-11 rounded-xl px-5 text-sm" };

type ButtonVariant = keyof typeof buttonStyles;
type ButtonSize = keyof typeof buttonSizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/25 disabled:pointer-events-none disabled:opacity-50",
    buttonStyles[variant],
    buttonSizes[size],
    className,
  );
}

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}

export function LinkButton({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...props} className={buttonClass(variant, size, className)} />;
}

const badgeTones = {
  gray: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};
export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "gray", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

const automationMeta: Record<AutomationStatus, [string, BadgeTone]> = {
  received: ["Received", "gray"],
  processing: ["Processing", "blue"],
  eligible: ["Eligible", "blue"],
  queued: ["Message queued", "violet"],
  sent: ["Sent", "green"],
  failed: ["Failed", "red"],
  skipped: ["Skipped", "gray"],
  ineligible: ["Ineligible", "yellow"],
};
const connectionMeta: Record<ConnectionStatus, [string, BadgeTone]> = {
  connected: ["Connected", "green"],
  expired: ["Connection expired", "yellow"],
  revoked: ["Permission revoked", "red"],
  error: ["Connection error", "red"],
  disconnected: ["Disconnected", "gray"],
};
const subscriptionMeta: Record<SubscriptionStatus, [string, BadgeTone]> = {
  trial: ["Trial", "violet"],
  active: ["Active", "green"],
  payment_pending: ["Payment pending", "yellow"],
  past_due: ["Past due", "red"],
  cancelled: ["Cancelled", "gray"],
  expired: ["Expired", "gray"],
  suspended: ["Suspended", "red"],
};
const ticketMeta: Record<TicketStatus, [string, BadgeTone]> = {
  open: ["Open", "blue"],
  in_progress: ["In progress", "violet"],
  waiting: ["Waiting for creator", "yellow"],
  resolved: ["Resolved", "green"],
  closed: ["Closed", "gray"],
};

function MetaBadge({ meta }: { meta: [string, BadgeTone] }) {
  return <Badge tone={meta[1]}>{meta[0]}</Badge>;
}
export const AutomationBadge = ({ status }: { status: AutomationStatus }) => <MetaBadge meta={automationMeta[status]} />;
export const ConnectionBadge = ({ status }: { status: ConnectionStatus }) => <MetaBadge meta={connectionMeta[status]} />;
export const SubscriptionBadge = ({ status }: { status: SubscriptionStatus }) => <MetaBadge meta={subscriptionMeta[status]} />;
// Creators see "waiting" from their side of the conversation.
export const TicketBadge = ({ status, creatorView }: { status: TicketStatus; creatorView?: boolean }) => (
  <MetaBadge meta={creatorView && status === "waiting" ? ["Awaiting your reply", "yellow"] : ticketMeta[status]} />
);

export function StatCard({ label, value, hint, delta, icon }: { label: string; value: ReactNode; hint?: string; delta?: number; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {icon && <span className="text-zinc-400">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {(hint || delta !== undefined) && (
        <p className="mt-1 text-xs text-zinc-500">
          {delta !== undefined && (
            <span className={cn("mr-1 font-medium", delta >= 0 ? "text-emerald-600" : "text-red-600")}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint}
        </p>
      )}
    </Card>
  );
}

export function Avatar({ name, hue, size = 36, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 75% 50%))` }}
    >
      {initials}
    </span>
  );
}

export function PostThumb({ hue, type, size = 48 }: { hue: number; type: "Reel" | "Post"; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-end justify-start overflow-hidden rounded-md p-1"
      style={{ width: size, height: size * 1.25, background: `linear-gradient(160deg, hsl(${hue} 65% 60%), hsl(${(hue + 50) % 360} 70% 40%))` }}
    >
      <span className="rounded bg-black/40 px-1 text-[9px] font-medium text-white">{type}</span>
    </span>
  );
}

// Real thumbnail when Instagram provides one, otherwise a stable gradient.
export function MediaThumb({ id, type, thumbnailUrl, size = 48 }: { id: string; type: "Reel" | "Post"; thumbnailUrl: string | null; size?: number }) {
  if (!thumbnailUrl) return <PostThumb hue={mediaHue(id)} type={type} size={size} />;
  return (
    <span className="relative inline-flex shrink-0 overflow-hidden rounded-md bg-zinc-100" style={{ width: size, height: size * 1.25 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
      <span className="absolute bottom-1 left-1 rounded bg-black/40 px-1 text-[9px] font-medium text-white">{type}</span>
    </span>
  );
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-zinc-800">
      {children}
      {hint && <span className="ml-1 font-normal text-zinc-400">{hint}</span>}
    </label>
  );
}

const fieldClass = "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-900/[0.02] transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(fieldClass, "h-10", className)} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(fieldClass, className)} />;
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cn(fieldClass, "field-select h-10 cursor-pointer", className)} />;
}

export function Field({ label, hint, children, help }: { label: string; hint?: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
      {help && <p className="mt-1 text-xs text-zinc-500">{help}</p>}
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{children}</p>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap border-b border-zinc-100 bg-zinc-50/70 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap border-b border-zinc-100 px-4 py-3.5 text-zinc-700", className)}>{children}</td>;
}

export function Progress({ value, tone = "violet" }: { value: number; tone?: "violet" | "green" | "yellow" | "red" }) {
  const colors = { violet: "bg-violet-600", green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-red-500" };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={cn("h-full rounded-full", colors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Callout({ tone = "violet", title, children, action }: { tone?: "violet" | "yellow" | "red" | "blue"; title: string; children?: ReactNode; action?: ReactNode }) {
  const tones = {
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    yellow: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5", tones[tone])}>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-0.5 text-sm opacity-80">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

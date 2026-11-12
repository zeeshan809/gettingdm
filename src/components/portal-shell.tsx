"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3, Bell, CreditCard, FileClock, Gauge, Instagram, LayoutDashboard, LifeBuoy,
  LogOut, Megaphone, Menu, Receipt, Server, Settings, ShieldCheck, Store, Users, Wallet, X, Zap,
} from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { Avatar, Badge, cn } from "./ui";
import { Logo } from "./logo";
import { ToastProvider } from "./interactive";

export type ShellUser = {
  name: string;
  subtitle: string;
  storefrontPath?: string;
  trialDaysLeft?: number | null;
  unreadCount?: number;
};

type NavItem = { href: string; label: string; icon: typeof Zap };

const creatorNav: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/campaigns", label: "Campaigns", icon: Zap },
      { href: "/storefront", label: "Storefront", icon: Store },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/instagram", label: "Instagram", icon: Instagram },
      { href: "/billing", label: "Subscription", icon: CreditCard },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/support", label: "Support", icon: LifeBuoy },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const adminNav: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Overview", icon: Gauge },
      { href: "/admin/analytics", label: "Platform analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/creators", label: "Creators", icon: Users },
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/admin/instagram", label: "Instagram health", icon: Instagram },
      { href: "/admin/infrastructure", label: "Infrastructure", icon: Server },
      { href: "/admin/support", label: "Support tickets", icon: LifeBuoy },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/admin/subscriptions", label: "Subscriptions & plans", icon: Wallet },
      { href: "/admin/payments", label: "Payments", icon: Receipt },
    ],
  },
  {
    title: "Security",
    items: [
      { href: "/admin/roles", label: "Admins & roles", icon: ShieldCheck },
      { href: "/admin/audit-logs", label: "Audit logs", icon: FileClock },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({ portal, user, children }: { portal: "creator" | "admin"; user: ShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Desktop only: hide the fixed sidebar. Remembered per browser.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("gdm-sidebar-collapsed") === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggleMenu = () => {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      const next = !collapsed;
      setCollapsed(next);
      try { localStorage.setItem("gdm-sidebar-collapsed", next ? "1" : "0"); } catch {}
    } else {
      setOpen(true);
    }
  };
  const nav = portal === "creator" ? creatorNav : adminNav;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-5">
        <Link href={portal === "creator" ? "/dashboard" : "/admin"} aria-label={APP_NAME} className="inline-flex items-center"><Logo className="h-7 w-auto" /></Link>
        {portal === "admin" && <Badge tone="red" className="ml-auto">Admin</Badge>}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.title && <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active ? "bg-violet-50 text-violet-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.href === "/notifications" && !!user.unreadCount && (
                        <span className="ml-auto rounded-full bg-violet-600 px-1.5 text-[10px] font-semibold text-white">{user.unreadCount > 99 ? "99+" : user.unreadCount}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user.trialDaysLeft != null && (
        <Link href="/billing" className="mx-3 mb-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs text-violet-900">
          <p className="font-semibold">Free trial · {user.trialDaysLeft} days left</p>
          <p className="mt-0.5 text-violet-700">Choose a plan to keep automations running →</p>
        </Link>
      )}

      <div className="flex items-center gap-2.5 border-t border-zinc-100 px-4 py-3">
        <Avatar name={user.name} hue={portal === "creator" ? 265 : 0} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.subtitle}</p>
        </div>
        <form action="/auth/signout" method="post">
          <input type="hidden" name="portal" value={portal} />
          <button type="submit" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className={cn("min-h-screen transition-[padding] duration-200", !collapsed && "xl:pl-64")}>
        <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white", !collapsed && "xl:block")}>{sidebar}</aside>

        {open && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <div className="absolute inset-0 bg-zinc-900/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
              <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3.5 rounded p-1 text-zinc-500" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={toggleMenu} className="-ml-1.5 rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100" aria-label={collapsed ? "Show menu" : "Toggle menu"}>
            <Menu className="h-5 w-5" />
          </button>
          <Link href={portal === "creator" ? "/dashboard" : "/admin"} aria-label={APP_NAME} className={cn("inline-flex items-center", !collapsed && "xl:hidden")}><Logo className="h-6 w-auto" /></Link>
          {portal === "admin" && <Badge tone="red">Admin</Badge>}
          {user.storefrontPath && (
            <Link href={user.storefrontPath} className="ml-auto text-xs font-medium text-violet-700">View storefront</Link>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}

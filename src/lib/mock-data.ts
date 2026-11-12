// Mock data layer. Every export here stands in for a future API call, so pages
// only import from this file and can be switched to real fetches later.
import type { PlanId } from "./config";

// Fixed reference date keeps server and client renders identical.
export const TODAY = "2026-11-10";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function isoDaysAgo(days: number) {
  const d = new Date(`${TODAY}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ---------- Types ----------

export type ConnectionStatus =
  | "connected" | "expired" | "revoked" | "error" | "disconnected";

export type SubscriptionStatus =
  | "trial" | "active" | "payment_pending" | "past_due" | "cancelled" | "expired" | "suspended";

export type AutomationStatus =
  | "received" | "processing" | "eligible" | "queued" | "sent" | "failed" | "skipped" | "ineligible";

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";

export type MatchRule = "contains" | "exact" | "starts_with";

export type FeaturedLink = {
  id: string;
  position: 1 | 2 | 3;
  title: string;
  description: string;
  url: string;
  buttonLabel: string;
  active: boolean;
};

export type CampaignLink = {
  title: string;
  description: string;
  url: string;
  buttonLabel: string;
  active: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  post: { id: string; caption: string; type: "Reel" | "Post"; thumbHue: number; postedAt: string };
  keywords: string[];
  matchRule: MatchRule;
  message: string;
  cta: string;
  link: CampaignLink;
  active: boolean;
  createdAt: string;
  stats: { comments: number; eligible: number; sent: number; failed: number; skipped: number; clicks: number };
};

export type Creator = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarHue: number;
  instagram: { handle: string; status: ConnectionStatus; connectedAt: string; tokenExpiresAt: string } | null;
  socials: { platform: string; url: string }[];
  theme: { brand: string; button: "rounded" | "pill" | "square"; style: "light" | "dark" };
  plan: PlanId;
  subscription: SubscriptionStatus;
  trialStart: string;
  trialEnd: string;
  joinedAt: string;
  campaignsCount: number;
  dmsSent: number;
  mrr: number;
};

// ---------- Current creator (the logged-in user in the creator portal) ----------

export const currentCreator: Creator = {
  id: "cr_001",
  name: "Zeeshan Hussain",
  username: "zeeshan",
  email: "zeeshan@example.com",
  bio: "Teaching Python, Excel & SQL in 60-second Reels. Grab every free resource below.",
  avatarHue: 265,
  instagram: {
    handle: "zeeshan.codes",
    status: "connected",
    connectedAt: "2026-10-18",
    tokenExpiresAt: "2026-12-17",
  },
  socials: [
    { platform: "Instagram", url: "https://instagram.com/zeeshan.codes" },
    { platform: "YouTube", url: "https://youtube.com/@zeeshancodes" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/zeeshan" },
  ],
  theme: { brand: "#3f79c9", button: "pill", style: "light" },
  plan: "creator",
  subscription: "trial",
  trialStart: "2026-10-18",
  trialEnd: "2026-11-17",
  joinedAt: "2026-10-18",
  campaignsCount: 4,
  dmsSent: 2184,
  mrr: 0,
};

export const featuredLinks: FeaturedLink[] = [
  { id: "fl_1", position: 1, title: "My Website", description: "Blogs, cheat sheets and more", url: "https://zeeshan.dev", buttonLabel: "Visit website", active: true },
  { id: "fl_2", position: 2, title: "Join My Community", description: "Free Telegram group, 12k+ learners", url: "https://t.me/zeeshancodes", buttonLabel: "Join now", active: true },
  { id: "fl_3", position: 3, title: "Explore My Courses", description: "Data analytics bootcamp — 40% off", url: "https://courses.zeeshan.dev", buttonLabel: "View courses", active: true },
];

export const defaultFourthLink: CampaignLink | null = {
  title: "Free Resume Template",
  description: "The template I used to land my first data job",
  url: "https://zeeshan.dev/resume",
  buttonLabel: "Download free",
  active: true,
};

export const campaigns: Campaign[] = [
  {
    id: "cmp_python",
    name: "Python Handbook Reel",
    post: { id: "ig_9001", caption: "5 Python tricks nobody teaches you 🐍 Comment PYTHON for the handbook", type: "Reel", thumbHue: 210, postedAt: "2026-11-02" },
    keywords: ["PYTHON", "PY"],
    matchRule: "contains",
    message: "Hey {first_name}! Thanks for commenting 🙌 Here's your Python Handbook.",
    cta: "Get the handbook",
    link: { title: "Python Handbook", description: "120-page beginner-to-pro PDF guide", url: "https://zeeshan.dev/python-handbook", buttonLabel: "Get the handbook", active: true },
    active: true,
    createdAt: "2026-11-02",
    stats: { comments: 1420, eligible: 1318, sent: 1287, failed: 31, skipped: 102, clicks: 864 },
  },
  {
    id: "cmp_excel",
    name: "Excel Dashboard Reel",
    post: { id: "ig_9002", caption: "Build this Excel dashboard in 10 minutes 📊 Comment EXCEL", type: "Reel", thumbHue: 145, postedAt: "2026-10-27" },
    keywords: ["EXCEL"],
    matchRule: "contains",
    message: "Here's your Excel dashboard template, {first_name}! 📊",
    cta: "Download template",
    link: { title: "Excel Dashboard Template", description: "Plug-and-play sales dashboard (.xlsx)", url: "https://zeeshan.dev/excel-dashboard", buttonLabel: "Download template", active: true },
    active: true,
    createdAt: "2026-10-27",
    stats: { comments: 612, eligible: 574, sent: 566, failed: 8, skipped: 38, clicks: 391 },
  },
  {
    id: "cmp_sql",
    name: "SQL Interview Reel",
    post: { id: "ig_9003", caption: "SQL questions asked at top product companies 💼 Comment SQL", type: "Reel", thumbHue: 25, postedAt: "2026-10-20" },
    keywords: ["SQL", "INTERVIEW"],
    matchRule: "exact",
    message: "Here are the SQL interview questions you asked for!",
    cta: "See the questions",
    link: { title: "SQL Interview Questions", description: "50 real questions with solutions", url: "https://zeeshan.dev/sql-questions", buttonLabel: "See questions", active: true },
    active: true,
    createdAt: "2026-10-20",
    stats: { comments: 344, eligible: 330, sent: 322, failed: 8, skipped: 14, clicks: 201 },
  },
  {
    id: "cmp_powerbi",
    name: "Power BI Teaser",
    post: { id: "ig_9004", caption: "Power BI vs Excel — which should you learn first?", type: "Post", thumbHue: 50, postedAt: "2026-10-12" },
    keywords: ["POWERBI"],
    matchRule: "contains",
    message: "Here's my Power BI starter kit!",
    cta: "Open starter kit",
    link: { title: "Power BI Starter Kit", description: "Sample datasets + practice file", url: "https://zeeshan.dev/powerbi", buttonLabel: "Open kit", active: false },
    active: false,
    createdAt: "2026-10-12",
    stats: { comments: 18, eligible: 12, sent: 9, failed: 3, skipped: 6, clicks: 4 },
  },
];

// Recent posts available to attach a new campaign to.
export const instagramMedia = [
  ...campaigns.map((c) => c.post),
  { id: "ig_9005", caption: "3 ChatGPT prompts for data analysts 🤖", type: "Reel" as const, thumbHue: 320, postedAt: "2026-11-08" },
  { id: "ig_9006", caption: "My desk setup for productive coding", type: "Post" as const, thumbHue: 180, postedAt: "2026-11-05" },
];

export type ActivityRow = {
  id: string;
  commenter: string;
  comment: string;
  campaignId: string;
  status: AutomationStatus;
  reason?: string;
  at: string;
};

export const recentActivity: ActivityRow[] = [
  { id: "a1", commenter: "@priya.learns", comment: "PYTHON please!!", campaignId: "cmp_python", status: "sent", at: "2026-11-10T09:42:00" },
  { id: "a2", commenter: "@rahul_dev", comment: "excel", campaignId: "cmp_excel", status: "sent", at: "2026-11-10T09:31:00" },
  { id: "a3", commenter: "@ankit.k", comment: "python 🔥", campaignId: "cmp_python", status: "queued", at: "2026-11-10T09:30:00" },
  { id: "a4", commenter: "@meera.codes", comment: "Python", campaignId: "cmp_python", status: "skipped", reason: "Already replied to this user", at: "2026-11-10T09:12:00" },
  { id: "a5", commenter: "@data.with.sam", comment: "sql bhai", campaignId: "cmp_sql", status: "ineligible", reason: "Exact match required", at: "2026-11-10T08:55:00" },
  { id: "a6", commenter: "@vikas_r", comment: "EXCEL", campaignId: "cmp_excel", status: "failed", reason: "Meta API: rate limit (retrying)", at: "2026-11-10T08:40:00" },
  { id: "a7", commenter: "@tanvi.s", comment: "PY", campaignId: "cmp_python", status: "sent", at: "2026-11-10T08:22:00" },
];

// ---------- Time series ----------

export type DailyPoint = {
  date: string;
  comments: number;
  sent: number;
  failed: number;
  visits: number;
  uniques: number;
  clicks: number;
};

export const creatorDaily: DailyPoint[] = (() => {
  const r = seeded(7);
  return Array.from({ length: 60 }, (_, i) => {
    const day = 59 - i;
    const base = 30 + i * 1.4;
    const comments = Math.round(base + r() * 35);
    const sent = Math.round(comments * (0.88 + r() * 0.06));
    const visits = Math.round(sent * (0.7 + r() * 0.3));
    return {
      date: isoDaysAgo(day),
      comments,
      sent,
      failed: Math.round(comments * (0.01 + r() * 0.03)),
      visits,
      uniques: Math.round(visits * 0.78),
      clicks: Math.round(visits * (0.5 + r() * 0.15)),
    };
  });
})();

export const linkPerformance = [
  { name: "Python Handbook", type: "Campaign", clicks: 864, uniques: 702 },
  { name: "Explore My Courses", type: "Global", clicks: 538, uniques: 441 },
  { name: "Join My Community", type: "Global", clicks: 497, uniques: 420 },
  { name: "Excel Dashboard Template", type: "Campaign", clicks: 391, uniques: 333 },
  { name: "My Website", type: "Global", clicks: 276, uniques: 231 },
  { name: "SQL Interview Questions", type: "Campaign", clicks: 201, uniques: 176 },
  { name: "Free Resume Template", type: "Default", clicks: 88, uniques: 80 },
];

export const purchaseSummary = { verified: 23, unverified: 9, attributedRevenue: 45_770, unattributedRevenue: 12_400 };

export const payments = [
  { id: "pay_Nf81", date: "2026-10-18", description: "Trial started", amount: 0, status: "success" as const, method: "—" },
];

export type Notification = { id: string; title: string; body: string; at: string; read: boolean; tone: "info" | "success" | "warning" | "danger" };

export const notifications: Notification[] = [
  { id: "n1", title: "Trial ends in 7 days", body: "Choose a plan to keep your campaigns running after 17 Nov.", at: "2026-11-10T08:00:00", read: false, tone: "warning" },
  { id: "n2", title: "Automation failures", body: "3 DMs failed on Power BI Teaser in the last 24 hours.", at: "2026-11-09T18:20:00", read: false, tone: "danger" },
  { id: "n3", title: "Campaign activated", body: "Python Handbook Reel is now live.", at: "2026-11-02T11:05:00", read: true, tone: "success" },
  { id: "n4", title: "Instagram connected", body: "@zeeshan.codes is connected.", at: "2026-10-18T10:00:00", read: true, tone: "info" },
];

export type Ticket = {
  id: string;
  subject: string;
  creator: string;
  status: TicketStatus;
  priority: "standard" | "priority";
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
};

export const creatorTickets: Ticket[] = [
  { id: "T-1042", subject: "DMs not sending on one Reel", creator: "zeeshan", status: "in_progress", priority: "standard", assignee: "Ananya (Support)", createdAt: "2026-11-08", updatedAt: "2026-11-09" },
  { id: "T-0987", subject: "How do I change my storefront username?", creator: "zeeshan", status: "resolved", priority: "standard", assignee: "Ananya (Support)", createdAt: "2026-10-22", updatedAt: "2026-10-22" },
];

// ---------- Storefront resolution ----------
// Mirrors PRD 7.4: the campaign id is validated against the creator; the
// destination URL is never taken from the query string.

// ---------- Admin data ----------

const firstNames = ["Aarav", "Diya", "Kabir", "Isha", "Rohan", "Sneha", "Arjun", "Kavya", "Vihaan", "Meera", "Aditya", "Riya", "Karan", "Pooja", "Nikhil", "Tanvi", "Siddharth", "Neha", "Yash", "Ananya", "Harsh", "Simran", "Varun", "Aditi"];
const lastNames = ["Sharma", "Patel", "Reddy", "Iyer", "Gupta", "Khan", "Nair", "Singh", "Joshi", "Mehta", "Das", "Kapoor"];
const niches = ["fitness", "finance", "codes", "cooks", "travels", "design", "study", "beauty"];
const subStatuses: SubscriptionStatus[] = ["active", "active", "active", "trial", "trial", "past_due", "cancelled", "expired", "payment_pending", "suspended"];
const connStatuses: ConnectionStatus[] = ["connected", "connected", "connected", "connected", "expired", "revoked", "error", "disconnected"];

export const allCreators: Creator[] = [
  { ...currentCreator },
  ...Array.from({ length: 47 }, (_, i): Creator => {
    const r = seeded(100 + i);
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 7) % lastNames.length];
    const niche = niches[i % niches.length];
    const username = `${first.toLowerCase()}${niche}`.slice(0, 18) + (i > 23 ? i : "");
    const sub = subStatuses[Math.floor(r() * subStatuses.length)];
    const plan: PlanId = r() > 0.72 ? "creator_plus" : "creator";
    const joinedDaysAgo = Math.floor(r() * 120) + 1;
    const joined = isoDaysAgo(joinedDaysAgo);
    const conn = connStatuses[Math.floor(r() * connStatuses.length)];
    const trialEnd = isoDaysAgo(joinedDaysAgo - 30);
    return {
      id: `cr_${String(i + 2).padStart(3, "0")}`,
      name: `${first} ${last}`,
      username,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      bio: `Sharing ${niche} tips every day.`,
      avatarHue: Math.floor(r() * 360),
      instagram: conn === "disconnected" ? null : { handle: `${first.toLowerCase()}.${niche}`, status: conn, connectedAt: joined, tokenExpiresAt: isoDaysAgo(joinedDaysAgo - 60) },
      socials: [],
      theme: { brand: "#3f79c9", button: "pill", style: "light" },
      plan,
      subscription: sub,
      trialStart: joined,
      trialEnd,
      joinedAt: joined,
      campaignsCount: Math.floor(r() * 12),
      dmsSent: Math.floor(r() * 9000),
      mrr: sub === "active" ? (plan === "creator_plus" ? 399 : 99) : 0,
    };
  }),
];

export const adminDaily = (() => {
  const r = seeded(42);
  return Array.from({ length: 60 }, (_, i) => {
    const day = 59 - i;
    return {
      date: isoDaysAgo(day),
      signups: Math.round(6 + i * 0.35 + r() * 8),
      activeCreators: Math.round(180 + i * 4 + r() * 25),
      comments: Math.round(4200 + i * 120 + r() * 900),
      dms: Math.round(3900 + i * 112 + r() * 800),
      failedDms: Math.round(60 + r() * 70),
      visits: Math.round(3100 + i * 90 + r() * 600),
      // Ends near adminKpis.finance.mrr (₹70,029).
      mrr: Math.round(26_000 + i * 740 + r() * 300),
    };
  });
})();

export const adminKpis = {
  users: { total: 1284, active: 912, trial: 386, paying: 471, cancelled: 64, suspended: 9, trialToPaid: 41.8 },
  instagram: { connected: 1036, disconnected: 248, activeCampaigns: 2310, comments: 412_880, dms: 389_204, failed: 6_942 },
  storefront: { total: 1284, visits: 288_410, uniques: 201_337, clicks: 156_902, verifiedPurchases: 1_148, attributedRevenue: 2_384_200 },
  finance: (() => {
    // 393 Creator + 78 Creator Plus = 471 paying, so revenue figures stay consistent.
    const byPlan = [
      { plan: "Creator", subscribers: 393, mrr: 393 * 99 },
      { plan: "Creator Plus", subscribers: 78, mrr: 78 * 399 },
    ];
    const mrr = byPlan[0].mrr + byPlan[1].mrr;
    return { mrr, arr: mrr * 12, totalRevenue: 162_640, failedPayments: 37, refunds: 6, churn: 4.2, arpu: Math.round((mrr / 471) * 10) / 10, byPlan };
  })(),
};

export const adminCampaigns = allCreators.slice(0, 30).flatMap((c, i) => {
  const r = seeded(500 + i);
  const n = Math.max(1, Math.min(3, c.campaignsCount));
  return Array.from({ length: n }, (_, j) => {
    const comments = Math.floor(r() * 3000);
    const failed = Math.floor(comments * r() * 0.08);
    return {
      id: `cmp_${c.username}_${j + 1}`,
      creator: c.username,
      name: `${["Free guide", "Template", "Checklist", "Workshop"][j % 4]} — ${c.bio.split(" ")[1]}`,
      keyword: ["GUIDE", "LINK", "FREE", "YES"][(i + j) % 4],
      status: (r() > 0.85 ? "paused_admin" : r() > 0.25 ? "active" : "inactive") as "active" | "inactive" | "paused_admin",
      comments,
      sent: comments - failed - Math.floor(comments * 0.05),
      failed,
      queued: Math.floor(r() * 25),
      duplicatesBlocked: Math.floor(r() * 40),
    };
  });
});

export const adminPayments = Array.from({ length: 36 }, (_, i) => {
  const r = seeded(900 + i);
  const c = allCreators[(i * 5) % allCreators.length];
  const plus = r() > 0.75;
  const roll = r();
  const status = roll > 0.9 ? "refunded" : roll > 0.8 ? "failed" : roll > 0.74 ? "pending" : "success";
  return {
    id: `pay_${(100000 + i * 7919).toString(36).toUpperCase()}`,
    razorpayId: `pay_R${(9_000_000 + i * 104_729).toString(36).toUpperCase()}`,
    creator: c.username,
    plan: plus ? "Creator Plus" : "Creator",
    amount: plus ? 399 : 99,
    status: status as "success" | "failed" | "pending" | "refunded",
    kind: r() > 0.3 ? "Renewal" : "New subscription",
    date: isoDaysAgo(Math.floor(i * 1.6)),
    reconciled: status === "success" ? r() > 0.06 : true,
  };
});

export const adminTickets: Ticket[] = [
  { id: "T-1048", subject: "Instagram keeps disconnecting", creator: "aaravfitness", status: "open", priority: "priority", assignee: null, createdAt: "2026-11-10", updatedAt: "2026-11-10" },
  { id: "T-1047", subject: "Refund request for double charge", creator: "diyafinance", status: "open", priority: "standard", assignee: "Rakesh (Finance)", createdAt: "2026-11-09", updatedAt: "2026-11-10" },
  { id: "T-1045", subject: "Storefront image not updating", creator: "kabircodes", status: "waiting", priority: "standard", assignee: "Ananya (Support)", createdAt: "2026-11-08", updatedAt: "2026-11-09" },
  ...creatorTickets,
  { id: "T-1039", subject: "Can I use two keywords on one Reel?", creator: "ishacooks", status: "resolved", priority: "standard", assignee: "Ananya (Support)", createdAt: "2026-11-06", updatedAt: "2026-11-06" },
  { id: "T-1031", subject: "Upgrade to Creator Plus failed", creator: "rohantravels", status: "closed", priority: "priority", assignee: "Rakesh (Finance)", createdAt: "2026-11-03", updatedAt: "2026-11-04" },
];

export const infraHealth = {
  services: [
    { name: "Web app (Cloudflare Pages)", status: "operational" as const, latency: 84 },
    { name: "API (Workers)", status: "operational" as const, latency: 142 },
    { name: "Database (Supabase)", status: "degraded" as const, latency: 318 },
    { name: "Image storage (R2)", status: "operational" as const, latency: 61 },
    { name: "Meta Graph API", status: "operational" as const, latency: 410 },
    { name: "Razorpay", status: "operational" as const, latency: 220 },
  ],
  usage: [
    { name: "Database storage", used: 342, limit: 500, unit: "MB" },
    { name: "DB connections", used: 41, limit: 60, unit: "" },
    { name: "R2 storage", used: 3.1, limit: 10, unit: "GB" },
    { name: "Worker requests (today)", used: 61_200, limit: 100_000, unit: "" },
  ],
  queue: { pending: 128, processing: 12, failed24h: 214, retries24h: 486, avgDelaySec: 4.2, webhookDelayP95: 2.8 },
  errors: [
    { at: "2026-11-10T09:40:00", source: "Meta API", message: "(#4) Application request limit reached", count: 38 },
    { at: "2026-11-10T09:12:00", source: "Worker", message: "Job timeout after 30s (automation_jobs)", count: 4 },
    { at: "2026-11-10T07:55:00", source: "Database", message: "Slow query > 800ms on storefront_events", count: 11 },
    { at: "2026-11-09T22:10:00", source: "Webhook", message: "Signature verification failed", count: 2 },
  ],
};

export const adminUsers = [
  { id: "ad_1", name: "Zeeshan Hussain", email: "founder@example.com", role: "Super Admin", lastActive: "2026-11-10T09:45:00" },
  { id: "ad_2", name: "Priyanka Rao", email: "ops@example.com", role: "Operations Admin", lastActive: "2026-11-10T08:10:00" },
  { id: "ad_3", name: "Rakesh Menon", email: "finance@example.com", role: "Finance Admin", lastActive: "2026-11-09T19:30:00" },
  { id: "ad_4", name: "Ananya Bose", email: "support@example.com", role: "Support Admin", lastActive: "2026-11-10T09:02:00" },
];

export const rolePermissions: { area: string; super: boolean; ops: boolean; finance: boolean; support: boolean }[] = [
  { area: "View creators", super: true, ops: true, finance: true, support: true },
  { area: "Suspend / reactivate creators", super: true, ops: true, finance: false, support: false },
  { area: "Delete creator accounts", super: true, ops: false, finance: false, support: false },
  { area: "Pause campaigns", super: true, ops: true, finance: false, support: false },
  { area: "Instagram integration health", super: true, ops: true, finance: false, support: true },
  { area: "Subscriptions & plan config", super: true, ops: false, finance: true, support: false },
  { area: "Payments & refunds", super: true, ops: false, finance: true, support: false },
  { area: "Infrastructure monitoring", super: true, ops: true, finance: false, support: false },
  { area: "Support tickets", super: true, ops: true, finance: false, support: true },
  { area: "Manage admins & roles", super: true, ops: false, finance: false, support: false },
  { area: "Audit logs", super: true, ops: true, finance: true, support: false },
];

export const auditLogs = [
  { id: "al_1", at: "2026-11-10T09:21:00", actor: "Priyanka Rao", role: "Operations Admin", action: "campaign.pause", target: "cmp_kavyabeauty_2", detail: "High failure rate (18%)", ip: "103.21.xx.xx" },
  { id: "al_2", at: "2026-11-10T08:47:00", actor: "Rakesh Menon", role: "Finance Admin", action: "refund.issue", target: "pay_2LXF", detail: "₹99 — duplicate charge", ip: "49.36.xx.xx" },
  { id: "al_3", at: "2026-11-09T17:02:00", actor: "Zeeshan Hussain", role: "Super Admin", action: "plan.update", target: "creator_plus", detail: "Campaign limit 30 → 50", ip: "103.21.xx.xx" },
  { id: "al_4", at: "2026-11-09T15:40:00", actor: "Priyanka Rao", role: "Operations Admin", action: "creator.suspend", target: "yashstudy", detail: "Spam reports", ip: "103.21.xx.xx" },
  { id: "al_5", at: "2026-11-09T11:13:00", actor: "Ananya Bose", role: "Support Admin", action: "ticket.assign", target: "T-1045", detail: "Assigned to self", ip: "122.161.xx.xx" },
  { id: "al_6", at: "2026-11-08T20:55:00", actor: "Zeeshan Hussain", role: "Super Admin", action: "admin.role_change", target: "ad_4", detail: "Support Admin granted", ip: "103.21.xx.xx" },
  { id: "al_7", at: "2026-11-08T10:30:00", actor: "Zeeshan Hussain", role: "Super Admin", action: "trial.config", target: "global", detail: "Trial duration 30 days", ip: "103.21.xx.xx" },
];

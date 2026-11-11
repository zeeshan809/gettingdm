import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AuditedAction } from "@/components/interactive";
import { Avatar, Badge, Card, CardHeader, ConnectionBadge, PageHeader, StatCard, SubscriptionBadge, Table, Td, Th, TicketBadge } from "@/components/ui";
import { adminCampaigns, adminPayments, adminTickets, allCreators } from "@/lib/mock-data";
import { date, inr, num } from "@/lib/format";

export function generateStaticParams() {
  return allCreators.map((c) => ({ id: c.id }));
}

export default async function AdminCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = allCreators.find((x) => x.id === id);
  if (!c) notFound();
  const camps = adminCampaigns.filter((x) => x.creator === c.username);
  const pays = adminPayments.filter((p) => p.creator === c.username);
  const tickets = adminTickets.filter((t) => t.creator === c.username);

  return (
    <>
      <Link href="/admin/creators" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Creators
      </Link>
      <PageHeader
        title={c.name}
        description={`@${c.username} · ${c.email} · joined ${date(c.joinedAt)}`}
        actions={
          <>
            <Link href={`/${c.username}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-violet-700"><ExternalLink className="h-4 w-4" /> Storefront</Link>
            {c.subscription === "suspended" ? (
              <AuditedAction label="Reactivate" title={`Reactivate @${c.username}?`} description="Campaigns can resume and the storefront goes back online." confirmLabel="Reactivate account" />
            ) : (
              <AuditedAction label="Suspend" danger title={`Suspend @${c.username}?`} description="All campaigns stop immediately and the storefront is hidden until reactivated." confirmLabel="Suspend account" />
            )}
            <AuditedAction label="Delete" danger title={`Delete @${c.username}?`} description="Starts the account deletion workflow: data is removed within 30 days per the deletion policy." confirmLabel="Start deletion" />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Campaigns" value={c.campaignsCount} />
        <StatCard label="DMs sent" value={num(c.dmsSent)} />
        <StatCard label="MRR" value={inr(c.mrr)} />
        <StatCard label="Support tickets" value={tickets.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Account" />
          <dl className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-3"><Avatar name={c.name} hue={c.avatarHue} size={40} /><span className="text-zinc-600">{c.bio}</span></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Plan</dt><dd>{c.plan === "creator_plus" ? "Creator Plus" : "Creator"}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Subscription</dt><dd><SubscriptionBadge status={c.subscription} /></dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Trial</dt><dd>{date(c.trialStart)} – {date(c.trialEnd)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Instagram</dt><dd><ConnectionBadge status={c.instagram?.status ?? "disconnected"} /></dd></div>
            {c.instagram && <div className="flex justify-between"><dt className="text-zinc-500">Handle</dt><dd>@{c.instagram.handle}</dd></div>}
            {c.instagram && <div className="flex justify-between"><dt className="text-zinc-500">Access token</dt><dd className="font-mono text-xs">IGQV••••••••••••</dd></div>}
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Campaigns" />
          <Table>
            <thead><tr><Th>Campaign</Th><Th>Keyword</Th><Th>Status</Th><Th className="text-right">Sent</Th><Th className="text-right">Failed</Th></tr></thead>
            <tbody>
              {camps.map((x) => (
                <tr key={x.id}>
                  <Td className="font-medium">{x.name}</Td>
                  <Td className="font-mono text-xs">{x.keyword}</Td>
                  <Td>{x.status === "active" ? <Badge tone="green">Active</Badge> : x.status === "paused_admin" ? <Badge tone="red">Paused by admin</Badge> : <Badge>Inactive</Badge>}</Td>
                  <Td className="text-right">{num(x.sent)}</Td>
                  <Td className="text-right">{num(x.failed)}</Td>
                </tr>
              ))}
              {camps.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-zinc-400">No campaigns.</td></tr>}
            </tbody>
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Payment history" />
          <Table>
            <thead><tr><Th>Date</Th><Th>Razorpay ID</Th><Th>Plan</Th><Th className="text-right">Amount</Th><Th>Status</Th></tr></thead>
            <tbody>
              {pays.map((p) => (
                <tr key={p.id}>
                  <Td>{date(p.date)}</Td>
                  <Td className="font-mono text-xs">{p.razorpayId}</Td>
                  <Td>{p.plan}</Td>
                  <Td className="text-right">{inr(p.amount)}</Td>
                  <Td><Badge tone={p.status === "success" ? "green" : p.status === "failed" ? "red" : p.status === "pending" ? "yellow" : "gray"}>{p.status}</Badge></Td>
                </tr>
              ))}
              {pays.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-zinc-400">No payments yet.</td></tr>}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Support history" />
          <ul className="divide-y divide-zinc-100">
            {tickets.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="truncate">{t.subject}</span>
                <TicketBadge status={t.status} />
              </li>
            ))}
            {tickets.length === 0 && <li className="px-5 py-6 text-center text-sm text-zinc-400">No tickets.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

import { Badge, Card, CardHeader, ConnectionBadge, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { allCreators, infraHealth, TODAY } from "@/lib/mock-data";
import { date, dateTime, daysBetween, num } from "@/lib/format";

export const metadata = { title: "Instagram health" };

export default function AdminInstagramPage() {
  const accounts = allCreators.filter((c) => c.instagram);
  const count = (s: string) => accounts.filter((c) => c.instagram?.status === s).length;
  const expiringSoon = accounts.filter((c) => c.instagram?.status === "connected" && daysBetween(TODAY, c.instagram.tokenExpiresAt) <= 14);
  const metaErrors = infraHealth.errors.filter((e) => e.source === "Meta API" || e.source === "Webhook");

  return (
    <>
      <PageHeader title="Instagram integration health" description="Connection status, token expiry, webhooks and Meta API errors. Raw tokens are never shown." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Connected" value={count("connected")} />
        <StatCard label="Token expired" value={count("expired")} />
        <StatCard label="Permission revoked" value={count("revoked")} />
        <StatCard label="Connection error" value={count("error")} />
        <StatCard label="Expiring ≤ 14 days" value={expiringSoon.length} />
        <StatCard label="Webhooks today" value={num(14_388)} hint="99.2% verified OK" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Accounts needing attention" />
          <Table>
            <thead><tr><Th>Creator</Th><Th>Handle</Th><Th>Status</Th><Th>Token expires</Th></tr></thead>
            <tbody>
              {accounts
                .filter((c) => c.instagram?.status !== "connected" || expiringSoon.includes(c))
                .map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium">{c.name}</Td>
                    <Td>@{c.instagram?.handle}</Td>
                    <Td><ConnectionBadge status={c.instagram!.status} /></Td>
                    <Td>{date(c.instagram!.tokenExpiresAt)}</Td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Recent Meta API & webhook errors" />
          <ul className="divide-y divide-zinc-100">
            {metaErrors.map((e) => (
              <li key={e.at} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <Badge tone={e.source === "Meta API" ? "yellow" : "red"}>{e.source}</Badge>
                  <span className="text-xs text-zinc-400">{dateTime(e.at)}</span>
                </div>
                <p className="mt-1.5 font-mono text-xs">{e.message}</p>
                <p className="text-xs text-zinc-500">{e.count} occurrences</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

import { Badge, Callout, Card, CardHeader, PageHeader, Progress, StatCard, Table, Td, Th } from "@/components/ui";
import { infraHealth } from "@/lib/mock-data";
import { dateTime, num } from "@/lib/format";

export const metadata = { title: "Infrastructure" };

export default function AdminInfrastructurePage() {
  const { services, usage, queue, errors } = infraHealth;
  const nearLimit = usage.filter((u) => u.used / u.limit >= 0.6);

  return (
    <>
      <PageHeader title="Infrastructure" description="Service health, free-tier usage, job queue and errors." />

      {nearLimit.length > 0 && (
        <div className="mb-6">
          <Callout tone="yellow" title={`${nearLimit.length} resources above 60% of their free-tier limit`}>
            {nearLimit.map((u) => u.name).join(", ")} — consider upgrading before they hit the limit.
          </Callout>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Services" />
          <ul className="divide-y divide-zinc-100">
            {services.map((s) => (
              <li key={s.name} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className={s.status === "operational" ? "h-2 w-2 rounded-full bg-emerald-500" : "h-2 w-2 rounded-full bg-amber-500"} />
                  {s.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{s.latency} ms</span>
                  <Badge tone={s.status === "operational" ? "green" : "yellow"}>{s.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Free-tier usage" />
          <div className="space-y-4 p-5">
            {usage.map((u) => {
              const p = (u.used / u.limit) * 100;
              return (
                <div key={u.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{u.name}</span>
                    <span className="text-zinc-500">{num(u.used)} / {num(u.limit)} {u.unit}</span>
                  </div>
                  <Progress value={p} tone={p >= 80 ? "red" : p >= 60 ? "yellow" : "green"} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-zinc-500">Background jobs</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Pending" value={num(queue.pending)} />
        <StatCard label="Processing" value={num(queue.processing)} />
        <StatCard label="Failed (24h)" value={num(queue.failed24h)} />
        <StatCard label="Retries (24h)" value={num(queue.retries24h)} />
        <StatCard label="Avg queue delay" value={`${queue.avgDelaySec}s`} />
        <StatCard label="Webhook delay p95" value={`${queue.webhookDelayP95}s`} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent errors" />
        <Table>
          <thead><tr><Th>Time</Th><Th>Source</Th><Th>Message</Th><Th className="text-right">Count</Th></tr></thead>
          <tbody>
            {errors.map((e) => (
              <tr key={e.at}>
                <Td>{dateTime(e.at)}</Td>
                <Td><Badge>{e.source}</Badge></Td>
                <Td className="font-mono text-xs">{e.message}</Td>
                <Td className="text-right">{e.count}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Card, EmptyState, LinkButton, MediaThumb, PageHeader } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { getCampaignStats } from "@/lib/campaigns-server";
import { createClient } from "@/lib/supabase/server";
import { date, num } from "@/lib/format";

export const metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const [{ data: campaigns }, statsFor] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, name, active, keywords, link_title, created_at, ig_media_id, media_type, media_caption, media_thumbnail_url")
      .eq("creator_id", creator.id)
      .order("active", { ascending: false })
      .order("created_at", { ascending: false }),
    getCampaignStats(),
  ]);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Each campaign watches one post or Reel for keywords and DMs the commenter."
        actions={<LinkButton href="/campaigns/new"><Plus className="h-4 w-4" /> New campaign</LinkButton>}
      />

      {!campaigns?.length ? (
        <Card>
          <EmptyState
            title="No campaigns yet"
            description="Pick a Reel, choose a keyword like PYTHON, and we'll DM everyone who comments it."
            action={<LinkButton href="/campaigns/new"><Plus className="h-4 w-4" /> Create your first campaign</LinkButton>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => {
            const s = statsFor(c.id);
            const delivery = s.eligible ? (s.sent / s.eligible) * 100 : 0;
            return (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <Card className="flex gap-4 p-4 transition-shadow hover:shadow-md">
                  <MediaThumb id={c.ig_media_id} type={c.media_type === "Post" ? "Post" : "Reel"} thumbnailUrl={c.media_thumbnail_url} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-zinc-900">{c.name}</p>
                      {c.active ? <Badge tone="green">Active</Badge> : <Badge>Paused</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{c.media_caption}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.keywords.map((k) => <Badge key={k} tone="violet" className="font-mono">{k}</Badge>)}
                    </div>
                    <dl className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div><dt className="text-zinc-400">Comments</dt><dd className="font-semibold">{num(s.comments)}</dd></div>
                      <div><dt className="text-zinc-400">DMs sent</dt><dd className="font-semibold">{num(s.sent)}</dd></div>
                      <div><dt className="text-zinc-400">Delivery</dt><dd className="font-semibold">{s.eligible ? `${delivery.toFixed(0)}%` : "—"}</dd></div>
                      <div><dt className="text-zinc-400">Clicks</dt><dd className="font-semibold">{num(s.clicks)}</dd></div>
                    </dl>
                    <p className="mt-3 text-xs text-zinc-400">4th link: <span className="text-zinc-600">{c.link_title}</span> · Created {date(c.created_at)}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

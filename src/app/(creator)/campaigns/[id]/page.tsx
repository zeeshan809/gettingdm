import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from "@/components/campaign-form";
import { AutomationBadge, Card, CardHeader, PageHeader, StatCard, Table, Td, Th } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { hasStorefront } from "@/lib/plan";
import { getCampaignStats } from "@/lib/campaigns-server";
import { getInstagramMedia } from "@/lib/instagram";
import { UUID_RE } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/server";
import { dateTime, num, pct } from "@/lib/format";
import type { InstagramMedia } from "@/lib/campaigns";
import { CampaignActions } from "./campaign-actions";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const creator = await getCurrentCreator();
  const supabase = await createClient();

  const [{ data: c }, statsFor, ig, { data: active }, { data: log }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("id", id).eq("creator_id", creator.id).maybeSingle(),
    getCampaignStats(id),
    getInstagramMedia(creator.id),
    supabase.from("campaigns").select("ig_media_id").eq("creator_id", creator.id).eq("active", true).neq("id", id),
    supabase
      .from("comment_events")
      .select("id, commenter_username, comment_text, status, error, received_at")
      .eq("campaign_id", id)
      .order("received_at", { ascending: false })
      .limit(50),
  ]);
  if (!c) notFound();
  const s = statsFor(id);

  // Keep the campaign's own post selectable even if it's no longer in the recent list.
  const ownMedia: InstagramMedia = {
    id: c.ig_media_id,
    type: c.media_type === "Post" ? "Post" : "Reel",
    caption: c.media_caption ?? "",
    thumbnailUrl: c.media_thumbnail_url,
    permalink: c.media_permalink,
    postedAt: c.media_posted_at ?? c.created_at,
  };
  const media = ig.media.some((m) => m.id === c.ig_media_id) ? ig.media : [ownMedia, ...ig.media];

  return (
    <>
      <Link href="/campaigns" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Campaigns
      </Link>
      <PageHeader title={c.name} description={c.media_caption ?? undefined} actions={<CampaignActions id={c.id} name={c.name} active={c.active} />} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Comments" value={num(s.comments)} />
        <StatCard label="Eligible" value={num(s.eligible)} />
        <StatCard label="Ineligible" value={num(s.ineligible)} />
        <StatCard label="DMs sent" value={num(s.sent)} />
        <StatCard label="Failed" value={num(s.failed)} />
        <StatCard label="Skipped" value={num(s.skipped)} hint="Duplicates & no match" />
        <StatCard label="Link CTR" value={pct(s.sent ? (s.clicks / s.sent) * 100 : 0)} hint={`${num(s.clicks)} ${s.clicks === 1 ? "click" : "clicks"}`} />
      </div>

      <CampaignForm
        key={c.updated_at}
        campaignId={c.id}
        initial={{
          name: c.name,
          mediaId: c.ig_media_id,
          keywords: c.keywords,
          matchRule: c.match_rule,
          message: c.message,
          cta: c.cta_label,
          link: { title: c.link_title, description: c.link_description, url: c.link_url, buttonLabel: c.link_button_label, active: c.link_active },
          active: c.active,
        }}
        media={media}
        sampleMedia={ig.sample}
        igHandle={ig.handle}
        username={creator.username}
        storefront={hasStorefront(creator.subscription)}
        mediaInUse={(active ?? []).map((a) => a.ig_media_id)}
      />

      <Card className="mt-6">
        <CardHeader title="Automation log" description="The latest 50 comments this campaign processed, with their delivery result." />
        <Table>
          <thead><tr><Th>Time</Th><Th>Commenter</Th><Th>Comment</Th><Th>Status</Th><Th>Detail</Th></tr></thead>
          <tbody>
            {(log ?? []).map((a) => (
              <tr key={a.id}>
                <Td>{dateTime(a.received_at)}</Td>
                <Td className="font-medium">{a.commenter_username ? `@${a.commenter_username}` : "—"}</Td>
                <Td>{a.comment_text ? `“${a.comment_text}”` : "—"}</Td>
                <Td><AutomationBadge status={a.status} /></Td>
                <Td className="text-zinc-500">{a.error ?? "—"}</Td>
              </tr>
            ))}
            {!log?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">No comments processed yet.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

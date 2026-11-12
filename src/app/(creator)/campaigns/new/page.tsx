import { CampaignForm } from "@/components/campaign-form";
import { PageHeader } from "@/components/ui";
import { getCurrentCreator } from "@/lib/auth";
import { hasStorefront } from "@/lib/plan";
import { getInstagramMedia } from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New campaign" };

export default async function NewCampaignPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const [ig, { data: active }] = await Promise.all([
    getInstagramMedia(creator.id),
    supabase.from("campaigns").select("ig_media_id").eq("creator_id", creator.id).eq("active", true),
  ]);

  return (
    <>
      <PageHeader title="New campaign" description="Automatically DM people who comment a keyword on your post or Reel." />
      <CampaignForm
        media={ig.media}
        sampleMedia={ig.sample}
        igHandle={ig.handle}
        username={creator.username}
        storefront={hasStorefront(creator.subscription)}
        mediaInUse={(active ?? []).map((c) => c.ig_media_id)}
      />
    </>
  );
}

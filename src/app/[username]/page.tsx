import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontView } from "@/components/storefront-view";
import { getPublicStorefront, trackStorefrontEvent } from "@/lib/storefront-server";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ campaign?: string | string[] }>;
};

const campaignParam = (c: string | string[] | undefined) => (typeof c === "string" ? c : undefined);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ username }, { campaign }] = await Promise.all([params, searchParams]);
  const store = await getPublicStorefront(username, campaignParam(campaign));
  return store?.storefrontEnabled ? { title: `${store.profile.name} (@${store.profile.username})`, description: store.profile.bio } : {};
}

export default async function PublicStorefrontPage({ params, searchParams }: Props) {
  const [{ username }, { campaign }] = await Promise.all([params, searchParams]);
  const store = await getPublicStorefront(username, campaignParam(campaign));
  if (!store || !store.storefrontEnabled) notFound();

  await trackStorefrontEvent({ creatorId: store.creatorId, campaignId: store.campaignId, type: "visit" });

  // Only a validated campaign id is carried into click links.
  const query = store.campaignId ? `?campaign=${store.campaignId}` : "";
  const base = `/go/${store.profile.username}`;

  return (
    <div className="min-h-screen">
      <StorefrontView profile={store.profile} featured={store.featured} fourth={store.fourth} hrefFor={(slot) => `${base}/${slot}${query}`} />
    </div>
  );
}

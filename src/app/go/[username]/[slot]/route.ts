import { NextResponse, type NextRequest } from "next/server";
import { getPublicStorefront, trackStorefrontEvent } from "@/lib/storefront-server";

// Click-tracking redirect. The destination is looked up from stored data with
// the same campaign validation as the storefront, never taken from the URL.
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string; slot: string }> }) {
  const { username, slot } = await params;
  const store = await getPublicStorefront(username, request.nextUrl.searchParams.get("campaign") ?? undefined);
  if (!store) return NextResponse.redirect(new URL("/", request.url));

  const n = Number(slot);
  const link = n === 4 ? store.fourth : store.featured.find((l) => l.position === n);
  if (!link) return NextResponse.redirect(new URL(`/${store.profile.username}`, request.url));

  await trackStorefrontEvent({ creatorId: store.creatorId, campaignId: store.campaignId, type: "click", slot: n });
  return NextResponse.redirect(link.url);
}

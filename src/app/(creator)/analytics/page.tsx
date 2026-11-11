import { RangeFilter } from "@/components/range-filter";
import { PageHeader } from "@/components/ui";
import { getCampaignTable, getDaily, getKeywordStats, getLinkStats } from "@/lib/analytics-server";
import { getCurrentCreator } from "@/lib/auth";
import { resolveRange } from "@/lib/date-range";
import { AnalyticsView } from "./analytics-view";

export const metadata = { title: "Analytics" };

type Props = { searchParams: Promise<{ range?: string; from?: string; to?: string }> };

export default async function AnalyticsPage({ searchParams }: Props) {
  const range = resolveRange(await searchParams);
  const creator = await getCurrentCreator();
  const [{ rows }, campaigns, keywords, links] = await Promise.all([
    getDaily(range),
    getCampaignTable(creator.id, range),
    getKeywordStats(range),
    getLinkStats(creator.id, range),
  ]);

  return (
    <>
      <PageHeader title="Analytics" description="Campaign, storefront and conversion performance." actions={<RangeFilter range={range} />} />
      <AnalyticsView rows={rows} campaigns={campaigns} keywords={keywords} links={links} />
    </>
  );
}

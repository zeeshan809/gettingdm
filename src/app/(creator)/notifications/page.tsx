import { getCurrentCreator } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "./notification-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, tone, title, body, link, read_at, created_at")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return <NotificationList items={data ?? []} />;
}

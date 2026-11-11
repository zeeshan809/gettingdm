import { getCurrentCreator } from "@/lib/auth";
import { parseEmailPrefs } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const creator = await getCurrentCreator();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name, email, email_prefs").eq("id", creator.id).single();

  return (
    <SettingsView
      username={creator.username}
      name={data?.full_name ?? ""}
      email={data?.email ?? creator.email}
      prefs={parseEmailPrefs(data?.email_prefs)}
    />
  );
}

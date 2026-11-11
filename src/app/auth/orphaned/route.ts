import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// A valid session whose account no longer has a creator profile or admin role
// (e.g. the account was deleted). Middleware would otherwise bounce it between
// /login and /dashboard forever. Only clears sessions that really are orphaned,
// so a forged link can't log anyone out.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims.sub;

  if (sub) {
    const [{ data: profile }, { data: admin }] = await Promise.all([
      supabase.from("profiles").select("id").eq("id", sub).maybeSingle(),
      supabase.from("admin_users").select("user_id").eq("user_id", sub).maybeSingle(),
    ]);
    if (profile) return NextResponse.redirect(new URL("/dashboard", request.url));
    if (admin) return NextResponse.redirect(new URL("/admin", request.url));
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/login?error=account", request.url));
}

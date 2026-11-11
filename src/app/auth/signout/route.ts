import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const form = await request.formData();
  const to = form.get("portal") === "admin" ? "/admin/login" : "/login";
  return NextResponse.redirect(new URL(to, request.url), { status: 303 });
}

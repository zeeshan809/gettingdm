import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { runDueWork } from "@/lib/dm-worker";

// Called every minute by Supabase pg_cron (see migration 20261112000600_dm_worker_cron.sql).
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const secret = process.env.DM_WORKER_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !given) return false;
  const a = Buffer.from(secret); const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  const result = await runDueWork();
  return NextResponse.json({ ok: true, ...result });
}

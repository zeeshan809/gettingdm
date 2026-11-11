import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentCreator } from "@/lib/auth";
import { OAUTH_COOKIE, RETURN_PATHS } from "@/lib/instagram-oauth";
import { authorizeUrl, metaConfig } from "@/lib/meta";

// Starts Facebook Login for Business. A random state in a short-lived cookie
// ties the callback to this browser (CSRF protection).
export async function GET(request: NextRequest) {
  await getCurrentCreator();
  const next = RETURN_PATHS.includes(request.nextUrl.searchParams.get("next") ?? "") ? request.nextUrl.searchParams.get("next")! : "/instagram";
  if (!metaConfig()) return NextResponse.redirect(new URL(`${next}?error=not_configured`, request.url));

  const state = randomBytes(24).toString("hex");
  const redirectUri = new URL("/api/instagram/callback", request.url).toString();
  const res = NextResponse.redirect(authorizeUrl(redirectUri, state));
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/instagram",
    maxAge: 600,
  });
  return res;
}

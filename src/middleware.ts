import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const CREATOR_PATHS = [
  "/dashboard", "/campaigns", "/storefront", "/analytics", "/instagram", "/billing",
  "/notifications", "/support", "/settings", "/onboarding",
];
const GUEST_ONLY_PATHS = ["/login", "/register"];

const matches = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

// Refreshes the Supabase session cookie on every request and gates portal routes.
// Pages still check roles server-side; this is only the first line.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;

  const redirectTo = (target: string) => {
    const res = NextResponse.redirect(new URL(target, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!signedIn && matches(path, CREATOR_PATHS)) {
    return redirectTo(`/login?next=${encodeURIComponent(path)}`);
  }
  if (!signedIn && path.startsWith("/admin") && path !== "/admin/login") {
    return redirectTo("/admin/login");
  }
  if (signedIn && GUEST_ONLY_PATHS.includes(path)) {
    return redirectTo("/dashboard");
  }
  return response;
}

export const config = {
  // Webhooks are server-to-server and carry no session.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/setup", "/auth/login", "/api/health", "/api/setup/owner", "/api/whatsapp/webhook"];

function decodeJwtSub(token?: string) {
  if (!token) return undefined;
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return typeof decoded.sub === "string" ? decoded.sub : undefined;
  } catch {
    return undefined;
  }
}

async function getVerifiedSupabaseUserId(token?: string) {
  if (!token) return undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return decodeJwtSub(token);
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return undefined;
  const user = await response.json().catch(() => null);
  return typeof user?.id === "string" ? user.id : undefined;
}

async function continueWithContext(request: NextRequest, token?: string) {
  const requestHeaders = new Headers(request.headers);
  const userId = await getVerifiedSupabaseUserId(token);
  if (token && !userId) {
    if (request.nextUrl.pathname.startsWith("/api")) return NextResponse.json({ error: "جلسة Supabase غير صالحة" }, { status: 401 });
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  const companyId = request.cookies.get("saheb_company_id")?.value ?? request.nextUrl.searchParams.get("company_id") ?? undefined;
  if (userId) requestHeaders.set("x-saheb-user-id", userId);
  if (companyId) requestHeaders.set("x-saheb-company-id", companyId);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))) return NextResponse.next();
  const authorization = request.headers.get("authorization");
  if (path.startsWith("/api") && authorization) return continueWithContext(request, authorization.replace(/^Bearer\s+/i, ""));
  const token = request.cookies.get("saheb_access_token")?.value;
  if (token) return continueWithContext(request, token);
  if (path.startsWith("/api")) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", path);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/dashboard/:path*", "/api/:path*"] };

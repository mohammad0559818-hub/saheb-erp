import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

async function getUserFromToken(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error("Supabase Auth env vars are missing");
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const user = await response.json().catch(() => null);
  if (!response.ok || typeof user?.id !== "string") throw new Error("جلسة Supabase غير صالحة");
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "") || request.cookies.get("saheb_access_token")?.value;
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const user = await getUserFromToken(token);
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("company_memberships")
      .select("company_id, role")
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ user: { id: user.id, email: user.email }, memberships: data ?? [], active_company_id: data?.[0]?.company_id ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تحميل جلسة المستخدم" }, { status: 401 });
  }
}

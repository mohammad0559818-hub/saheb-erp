import { NextRequest, NextResponse } from "next/server";
import { erpModules } from "@/lib/modules";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!companyId || q.length < 2) return NextResponse.json({ results: [] });
  const supabase = createSupabaseServiceClient();
  const results = [];
  for (const module of erpModules.slice(0, 15)) {
    const { data } = await supabase.from(module.table).select("id,name_ar,status,created_at").eq("company_id", companyId).ilike("name_ar", `%${q}%`).range(0, 4);
    if (data?.length) results.push({ module: module.key, label: module.label, records: data });
  }
  return NextResponse.json({ q, results });
}

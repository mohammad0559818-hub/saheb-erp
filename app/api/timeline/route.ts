import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const subjectId = request.nextUrl.searchParams.get("subject_id");
  if (!companyId) return NextResponse.json({ error: "company_id مطلوب" }, { status: 422 });
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("activity_logs").select("id,action,name_ar,actor_id,metadata,created_at").eq("company_id", companyId).order("created_at", { ascending: false }).range(0, 49);
  if (subjectId) query = query.eq("metadata->>subject_id", subjectId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ timeline: data });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.company_id || !body.key) return NextResponse.json({ error: "company_id و key مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: body.company_id, moduleKey: "settings", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("system_settings").insert({ company_id: body.company_id, key: body.key, value: body.value ?? {}, name_ar: body.name_ar ?? body.key }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id: body.company_id, action: "settings.create", subject_table: "system_settings", subject_id: data?.id });
  return NextResponse.json({ setting: data }, { status: 201 });
}

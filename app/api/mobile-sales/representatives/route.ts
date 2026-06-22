import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, employee_id, name_ar, territory, target_amount = 0 } = body;
  if (!company_id || !name_ar) return NextResponse.json({ error: "company_id و name_ar مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "mobile_sales", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("mobile_sales_representatives").insert({ company_id, branch_id, employee_id, name_ar, territory, target_amount, status: "active" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "mobile_sales.create", subject_table: "mobile_sales_representatives", subject_id: data?.id });
  return NextResponse.json({ representative: data }, { status: 201 });
}

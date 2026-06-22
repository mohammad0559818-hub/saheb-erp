import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.company_id || !body.name_ar) return NextResponse.json({ error: "company_id و name_ar مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: body.company_id, moduleKey: "banks", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("bank_accounts").insert({ currency: "SAR", balance: 0, status: "active", ...body }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id: body.company_id, branch_id: body.branch_id, action: "banks.create", subject_table: "bank_accounts", subject_id: data?.id });
  return NextResponse.json({ bank: data }, { status: 201 });
}

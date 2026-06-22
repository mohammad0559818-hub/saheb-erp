import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const { company_id, branch_id, party_type, party_id, statement_balance, erp_balance, source_module = "reconciliation" } = await request.json();
  if (!company_id || !party_type || !party_id) return NextResponse.json({ error: "بيانات التحليل غير مكتملة" }, { status: 422 });
  const difference = Number(erp_balance ?? 0) - Number(statement_balance ?? 0);
  const severity = Math.abs(difference) > 10000 ? "high" : Math.abs(difference) > 1000 ? "medium" : "low";
  const suggested_reason = difference > 0 ? "قد توجد تحصيلات غير مسجلة في كشف العميل/المورد" : "قد توجد فواتير أو إشعارات غير مرحلة في ERP";
  const suggested_action = Math.abs(difference) < 0.01 ? "لا يوجد إجراء" : "راجع الفواتير والمدفوعات غير المطابقة وافتح طلب موافقة للتسوية";
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "ai_discrepancy_analysis", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("ai_discrepancy_findings").insert({ company_id, branch_id, source_module, severity, difference_amount: difference, suggested_reason, suggested_action, name_ar: `تحليل فرق ${party_type}`, metadata: { party_type, party_id, statement_balance, erp_balance } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "ai_discrepancy_analysis.create", subject_table: "ai_discrepancy_findings", subject_id: data?.id });
  return NextResponse.json({ finding: data }, { status: 201 });
}

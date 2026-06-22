import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, supplier_id, payment_no, amount, method = "bank", name_ar = "دفعة مورد" } = body;
  if (!company_id || !supplier_id || !payment_no || !amount) return NextResponse.json({ error: "company_id و supplier_id و payment_no و amount مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "suppliers", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("supplier_payments").insert({ company_id, branch_id, supplier_id, payment_no, amount, method, name_ar, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog({ company_id, branch_id, action: "supplier_payments.create", subject_table: "supplier_payments", subject_id: data.id });
  await auditWorkflow({ company_id, branch_id, action: "suppliers.create", subject_table: "supplier_payments", subject_id: data?.id });
  return NextResponse.json({ payment: data }, { status: 201 });
}

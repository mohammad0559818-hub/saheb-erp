import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, customer_id, representative_id, collection_no, amount, method = "cash", name_ar = "تحصيل عميل" } = body;
  if (!company_id || !customer_id || !collection_no || !amount) return NextResponse.json({ error: "company_id و customer_id و collection_no و amount مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "customers", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("customer_collections").insert({ company_id, branch_id, customer_id, representative_id, collection_no, amount, method, name_ar, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAuditLog({ company_id, branch_id, action: "customer_collections.create", subject_table: "customer_collections", subject_id: data.id });
  await auditWorkflow({ company_id, branch_id, action: "customers.create", subject_table: "customer_collections", subject_id: data?.id });
  return NextResponse.json({ collection: data }, { status: 201 });
}

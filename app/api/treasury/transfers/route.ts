import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

type AccountType = "cashbox" | "safe" | "bank";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, from_type, from_id, to_type, to_id, amount, name_ar = "تحويل خزينة" } = body as { company_id: string; branch_id?: string; from_type: AccountType; from_id: string; to_type: AccountType; to_id: string; amount: number; name_ar?: string };
  if (!company_id || !from_type || !from_id || !to_type || !to_id || !amount || amount <= 0) return NextResponse.json({ error: "بيانات التحويل غير مكتملة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "transfers", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("treasury_transfers").insert({ company_id, branch_id, from_type, from_id, to_type, to_id, amount, name_ar, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("cash_movements").insert([
    { company_id, branch_id, source_type: from_type, source_id: from_id, direction: "out", amount, name_ar: `صرف ${name_ar}`, transfer_id: data.id },
    { company_id, branch_id, source_type: to_type, source_id: to_id, direction: "in", amount, name_ar: `استلام ${name_ar}`, transfer_id: data.id },
  ]);
  await auditWorkflow({ company_id, branch_id, action: "transfers.create", subject_table: "treasury_transfers", subject_id: data?.id });
  return NextResponse.json({ transfer: data }, { status: 201 });
}

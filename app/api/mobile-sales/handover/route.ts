import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, representative_id, cashier_id, collection_ids = [], name_ar = "تسليم عهدة مندوب" } = body;
  if (!company_id || !representative_id || !cashier_id || !collection_ids.length) return NextResponse.json({ error: "بيانات تسليم المندوب غير مكتملة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "mobile_sales", action: "approve" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: collections } = await supabase.from("customer_collections").select("id,amount").in("id", collection_ids).eq("company_id", company_id);
  const total = (collections ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
  const { data, error } = await supabase.from("cashier_handovers").insert({ company_id, branch_id, representative_id, cashier_id, collection_ids, total_amount: total, name_ar, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("customer_collections").update({ handover_id: data.id, status: "approved" }).in("id", collection_ids);
  await auditWorkflow({ company_id, branch_id, action: "mobile_sales.approve", subject_table: "cashier_handovers", subject_id: data?.id });
  return NextResponse.json({ handover: data, total_amount: total }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const { company_id, branch_id, document_type, party_type, party_id, seller_vat_id, buyer_vat_id, subtotal = 0, vat_rate = 15, name_ar = "مستند ضريبي" } = await request.json();
  if (!company_id || !document_type || !party_type || !party_id || !seller_vat_id) return NextResponse.json({ error: "بيانات VAT غير مكتملة" }, { status: 422 });
  const vat_amount = Number(subtotal) * Number(vat_rate) / 100;
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "multi_vat", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("vat_documents").insert({ company_id, branch_id, document_type, party_type, party_id, seller_vat_id, buyer_vat_id, subtotal, vat_rate, vat_amount, total: Number(subtotal) + vat_amount, name_ar, status: "active" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "multi_vat.create", subject_table: "vat_documents", subject_id: data?.id });
  return NextResponse.json({ vat_document: data }, { status: 201 });
}

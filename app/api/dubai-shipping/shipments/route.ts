import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, warehouse_id, awb, carrier, origin_country, eta, clearance_cost = 0, purchase_invoice_id, name_ar = "شحنة دبي" } = body;
  if (!company_id || !awb) return NextResponse.json({ error: "company_id و awb مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "dubai_shipping_office", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("dubai_shipping_shipments").insert({ company_id, branch_id, warehouse_id, awb, carrier, origin_country, eta, clearance_cost, name_ar, metadata: { purchase_invoice_id }, status: "active" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (purchase_invoice_id) await supabase.from("landed_cost_allocations").insert({ company_id, branch_id, shipment_id: data.id, purchase_invoice_id, amount: clearance_cost, name_ar: `تكلفة تخليص ${awb}` });
  await auditWorkflow({ company_id, branch_id, action: "dubai_shipping_office.create", subject_table: "dubai_shipping_shipments", subject_id: data?.id });
  return NextResponse.json({ shipment: data }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const { company_id, branch_id, from_warehouse_id, to_warehouse_id, item_id, quantity, unit_cost = 0, name_ar = "تحويل مستودعي" } = await request.json();
  if (!company_id || !from_warehouse_id || !to_warehouse_id || !item_id || !quantity) return NextResponse.json({ error: "بيانات التحويل المستودعي غير مكتملة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "warehouses", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: transfer, error } = await supabase.from("warehouse_transfers").insert({ company_id, branch_id, from_warehouse_id, to_warehouse_id, item_id, quantity, unit_cost, name_ar, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("inventory_movements").insert([
    { company_id, branch_id, warehouse_id: from_warehouse_id, item_id, direction: "out", quantity, unit_cost, name_ar: `صرف ${name_ar}`, metadata: { transfer_id: transfer.id } },
    { company_id, branch_id, warehouse_id: to_warehouse_id, item_id, direction: "in", quantity, unit_cost, name_ar: `استلام ${name_ar}`, metadata: { transfer_id: transfer.id } },
  ]);
  await writeAuditLog({ company_id, branch_id, action: "warehouse_transfers.create", subject_table: "warehouse_transfers", subject_id: transfer.id });
  await auditWorkflow({ company_id, branch_id, action: "warehouses.create", subject_table: "warehouse_transfers", subject_id: transfer?.id });
  return NextResponse.json({ transfer }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";
import { stockMovementValue } from "@/lib/erp/inventory";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, warehouse_id, item_id, direction, quantity, unit_cost } = body;
  if (!company_id || !warehouse_id || !item_id || !direction || !quantity) return NextResponse.json({ error: "بيانات حركة المخزون غير مكتملة" }, { status: 422 });
  const movementValue = stockMovementValue(direction, Number(quantity), Number(unit_cost ?? 0));
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "inventory", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("inventory_movements").insert({ company_id, branch_id, warehouse_id, item_id, direction, quantity, unit_cost, name_ar: "حركة مخزون", metadata: { movement_value: movementValue } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("stock_valuation_layers").insert({ company_id, branch_id, warehouse_id, item_id, movement_id: data.id, quantity_delta: direction === "out" ? -quantity : quantity, unit_cost, total_value: movementValue });
  await auditWorkflow({ company_id, branch_id, action: "inventory.create", subject_table: "inventory_movements", subject_id: data?.id });
  return NextResponse.json({ movement: data, movement_value: movementValue }, { status: 201 });
}

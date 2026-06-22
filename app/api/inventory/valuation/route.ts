import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const warehouseId = request.nextUrl.searchParams.get("warehouse_id");
  if (!companyId) return NextResponse.json({ error: "company_id مطلوب" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: companyId, moduleKey: "inventory", action: "read" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("stock_valuation_layers").select("item_id, warehouse_id, quantity_delta, total_value").eq("company_id", companyId);
  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const byItem = new Map<string, { item_id: string; warehouse_id: string; quantity: number; value: number; average_cost: number }>();
  for (const row of data ?? []) {
    const key = `${row.warehouse_id}:${row.item_id}`;
    const current = byItem.get(key) ?? { item_id: row.item_id, warehouse_id: row.warehouse_id, quantity: 0, value: 0, average_cost: 0 };
    current.quantity += Number(row.quantity_delta ?? 0);
    current.value += Number(row.total_value ?? 0);
    current.average_cost = current.quantity ? current.value / current.quantity : 0;
    byItem.set(key, current);
  }
  const rows = [...byItem.values()];
  return NextResponse.json({ total_value: rows.reduce((sum, row) => sum + row.value, 0), rows });
}

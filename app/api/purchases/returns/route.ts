import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { calculateLines } from "@/lib/erp/documents";
import { requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireWorkflowPermission(request, { companyId: body.company_id, moduleKey: "purchase_returns", action: "create" });
    const totals = calculateLines(body.lines, "unit_cost");
    const supabase = createSupabaseServiceClient();
    const header = { company_id: body.company_id, branch_id: body.branch_id, warehouse_id: body.warehouse_id, supplier_id: body.supplier_id, purchase_invoice_id: body.purchase_invoice_id, return_no: body.return_no, return_date: body.return_date, name_ar: body.name_ar ?? `مرتجع مشتريات ${body.return_no}`, status: "approved", subtotal: totals.subtotal, vat_total: totals.vat_total, total: totals.total, metadata: body.metadata ?? {} };
    const { data, error } = await supabase.from("purchase_returns").insert(header).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = totals.lines.map((line) => ({ ...line, company_id: body.company_id, branch_id: body.branch_id, purchase_return_id: data.id }));
    await supabase.from("purchase_return_lines").insert(rows).select("*");
    for (const line of totals.lines.filter((l) => l.item_id && body.warehouse_id)) await supabase.from("inventory_movements").insert({ company_id: body.company_id, branch_id: body.branch_id, warehouse_id: body.warehouse_id, item_id: line.item_id, direction: "out", quantity: line.quantity, unit_cost: line.unit_cost ?? 0, name_ar: `مرتجع مشتريات ${body.return_no}`, status: "approved", metadata: { purchase_return_id: data.id } });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر إنشاء مرتجع المشتريات" }, { status: 422 }); }
}

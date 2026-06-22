import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { calculateLines } from "@/lib/erp/documents";
import { requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireWorkflowPermission(request, { companyId: body.company_id, moduleKey: "sales_quotations", action: "create" });
    const totals = calculateLines(body.lines, "unit_price");
    const supabase = createSupabaseServiceClient();
    const header = { company_id: body.company_id, branch_id: body.branch_id, customer_id: body.customer_id, quotation_no: body.quotation_no, issue_date: body.issue_date, valid_until: body.valid_until, name_ar: body.name_ar ?? `عرض سعر ${body.quotation_no}`, status: body.status ?? "draft", subtotal: totals.subtotal, vat_total: totals.vat_total, total: totals.total, metadata: body.metadata ?? {} };
    const { data, error } = await supabase.from("sales_quotations").insert(header).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const lines = totals.lines.map((line) => ({ ...line, company_id: body.company_id, branch_id: body.branch_id, quotation_id: data.id }));
    const lineResult = await supabase.from("sales_quotation_lines").insert(lines).select("*");
    if (lineResult.error) return NextResponse.json({ error: lineResult.error.message }, { status: 500 });
    return NextResponse.json({ data, lines: lineResult.data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر إنشاء عرض السعر" }, { status: 422 }); }
}

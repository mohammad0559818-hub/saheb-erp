import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, warehouse_id, customer_id, invoice_no, lines = [] } = body;
  if (!company_id || !customer_id || !invoice_no || !lines.length) return NextResponse.json({ error: "بيانات فاتورة المبيعات غير مكتملة" }, { status: 422 });
  const subtotal = lines.reduce((sum: number, line: any) => sum + Number(line.quantity) * Number(line.unit_price), 0);
  const vat_total = lines.reduce((sum: number, line: any) => sum + Number(line.quantity) * Number(line.unit_price) * Number(line.vat_rate ?? 15) / 100, 0);
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "sales", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: invoice, error } = await supabase.from("sales_invoices").insert({ company_id, branch_id, warehouse_id, customer_id, invoice_no, name_ar: invoice_no, subtotal, vat_total, total: subtotal + vat_total, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const invoiceLines = lines.map((line: any) => ({ ...line, company_id, branch_id, sales_invoice_id: invoice.id, line_total: Number(line.quantity) * Number(line.unit_price) }));
  await supabase.from("sales_invoice_lines").insert(invoiceLines);
  await auditWorkflow({ company_id, branch_id, action: "sales.create", subject_table: "sales_invoices", subject_id: invoice?.id });
  return NextResponse.json({ invoice, lines: invoiceLines }, { status: 201 });
}

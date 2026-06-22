import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, warehouse_id, supplier_id, invoice_no, lines = [] } = body;
  if (!company_id || !supplier_id || !invoice_no || !lines.length) return NextResponse.json({ error: "بيانات فاتورة المشتريات غير مكتملة" }, { status: 422 });
  const subtotal = lines.reduce((sum: number, line: any) => sum + Number(line.quantity) * Number(line.unit_cost), 0);
  const vat_total = lines.reduce((sum: number, line: any) => sum + Number(line.quantity) * Number(line.unit_cost) * Number(line.vat_rate ?? 15) / 100, 0);
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "purchases", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: invoice, error } = await supabase.from("purchase_invoices").insert({ company_id, branch_id, warehouse_id, supplier_id, invoice_no, name_ar: invoice_no, subtotal, vat_total, total: subtotal + vat_total, status: "approved" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const invoiceLines = lines.map((line: any) => ({ ...line, company_id, branch_id, purchase_invoice_id: invoice.id, line_total: Number(line.quantity) * Number(line.unit_cost) }));
  await supabase.from("purchase_invoice_lines").insert(invoiceLines);
  await auditWorkflow({ company_id, branch_id, action: "purchases.create", subject_table: "purchase_invoices", subject_id: invoice?.id });
  return NextResponse.json({ invoice, lines: invoiceLines }, { status: 201 });
}

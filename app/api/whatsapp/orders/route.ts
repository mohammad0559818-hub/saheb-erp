import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const { company_id, branch_id, customer_id, warehouse_id, customer_phone, message, parsed_items = [], name_ar = "طلب واتساب", invoice_no } = await request.json();
  if (!company_id || !customer_phone || !message) return NextResponse.json({ error: "company_id و customer_phone و message مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "sales", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const normalizedItems = Array.isArray(parsed_items) ? parsed_items : [];
  const { data: order, error } = await supabase.from("whatsapp_orders").insert({ company_id, branch_id, customer_phone, message, parsed_items: normalizedItems, name_ar, status: customer_id && normalizedItems.length ? "pending" : "draft", metadata: { customer_id, warehouse_id } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!customer_id || !normalizedItems.length) return NextResponse.json({ order, next_action: "match_customer_and_items" }, { status: 201 });

  const lines = normalizedItems.map((item: any) => ({
    item_id: item.item_id,
    description: item.description ?? item.sku ?? item.name_ar ?? "صنف واتساب",
    quantity: Number(item.quantity ?? item.qty ?? 1),
    unit_price: Number(item.unit_price ?? item.price ?? 0),
    vat_rate: Number(item.vat_rate ?? 15),
  }));
  const subtotal = lines.reduce((sum: number, line: any) => sum + line.quantity * line.unit_price, 0);
  const vat_total = lines.reduce((sum: number, line: any) => sum + line.quantity * line.unit_price * line.vat_rate / 100, 0);
  const salesInvoiceNo = invoice_no ?? `WA-${String(order.id).slice(0, 8)}`;
  const { data: invoice, error: invoiceError } = await supabase.from("sales_invoices").insert({ company_id, branch_id, warehouse_id, customer_id, invoice_no: salesInvoiceNo, name_ar: `فاتورة ${salesInvoiceNo}`, subtotal, vat_total, total: subtotal + vat_total, status: "draft", metadata: { source: "whatsapp", whatsapp_order_id: order.id, customer_phone } }).select("*").single();
  if (invoiceError) return NextResponse.json({ order, error: invoiceError.message }, { status: 500 });
  const invoiceLines = lines.map((line: any) => ({ ...line, company_id, branch_id, sales_invoice_id: invoice.id, line_total: line.quantity * line.unit_price }));
  const { error: linesError } = await supabase.from("sales_invoice_lines").insert(invoiceLines);
  if (linesError) return NextResponse.json({ order, invoice, error: linesError.message }, { status: 500 });
  await supabase.from("whatsapp_orders").update({ status: "approved", metadata: { customer_id, warehouse_id, sales_invoice_id: invoice.id } }).eq("id", order.id);
  await auditWorkflow({ company_id, branch_id, action: "sales.create", subject_table: "whatsapp_orders", subject_id: order?.id });
  return NextResponse.json({ order: { ...order, status: "approved" }, invoice, lines: invoiceLines }, { status: 201 });
}

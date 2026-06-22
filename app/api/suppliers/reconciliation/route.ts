import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

async function calculateSupplierBalance(companyId: string, supplierId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: invoices } = await supabase.from("purchase_invoices").select("id,invoice_no,issue_date,total,status").eq("company_id", companyId).eq("supplier_id", supplierId);
  const { data: payments } = await supabase.from("supplier_payments").select("id,payment_no,payment_date,amount,status").eq("company_id", companyId).eq("supplier_id", supplierId);
  const invoiceTotal = (invoices ?? []).reduce((sum: number, row: any) => sum + Number(row.total ?? 0), 0);
  const paymentTotal = (payments ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
  return { supplier_id: supplierId, invoice_total: invoiceTotal, payment_total: paymentTotal, erp_balance: invoiceTotal - paymentTotal, invoices, payments };
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const supplierId = request.nextUrl.searchParams.get("supplier_id");
  if (!companyId || !supplierId) return NextResponse.json({ error: "company_id و supplier_id مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId, moduleKey: "supplier_reconciliations", action: "read" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  return NextResponse.json(await calculateSupplierBalance(companyId, supplierId));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, supplier_id, statement_balance, name_ar = "مطابقة مورد" } = body;
  if (!company_id || !supplier_id) return NextResponse.json({ error: "company_id و supplier_id مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "supplier_reconciliations", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const balance = await calculateSupplierBalance(company_id, supplier_id);
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("supplier_reconciliations").insert({ company_id, branch_id, supplier_id, name_ar, ledger_balance: balance.erp_balance, statement_balance: Number(statement_balance ?? 0), status: Math.abs(balance.erp_balance - Number(statement_balance ?? 0)) < 0.01 ? "approved" : "draft", metadata: { invoices: balance.invoices?.length ?? 0, payments: balance.payments?.length ?? 0 } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "supplier_reconciliations.create", subject_table: "supplier_reconciliations", subject_id: data?.id });
  return NextResponse.json({ reconciliation: data }, { status: 201 });
}

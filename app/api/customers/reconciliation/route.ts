import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

async function calculateCustomerBalance(companyId: string, customerId: string) {
  const supabase = createSupabaseServiceClient();
  const { data: invoices } = await supabase.from("sales_invoices").select("id,invoice_no,issue_date,total,status").eq("company_id", companyId).eq("customer_id", customerId);
  const { data: collections } = await supabase.from("customer_collections").select("id,collection_no,collection_date,amount,status").eq("company_id", companyId).eq("customer_id", customerId);
  const invoiceTotal = (invoices ?? []).reduce((sum: number, row: any) => sum + Number(row.total ?? 0), 0);
  const collectionTotal = (collections ?? []).reduce((sum: number, row: any) => sum + Number(row.amount ?? 0), 0);
  return { customer_id: customerId, invoice_total: invoiceTotal, collection_total: collectionTotal, erp_balance: invoiceTotal - collectionTotal, invoices, collections };
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const customerId = request.nextUrl.searchParams.get("customer_id");
  if (!companyId || !customerId) return NextResponse.json({ error: "company_id و customer_id مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId, moduleKey: "customer_reconciliations", action: "read" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  return NextResponse.json(await calculateCustomerBalance(companyId, customerId));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, customer_id, statement_balance, name_ar = "مطابقة عميل" } = body;
  if (!company_id || !customer_id) return NextResponse.json({ error: "company_id و customer_id مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "customer_reconciliations", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const balance = await calculateCustomerBalance(company_id, customer_id);
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("customer_reconciliations").insert({ company_id, branch_id, customer_id, name_ar, ledger_balance: balance.erp_balance, statement_balance: Number(statement_balance ?? 0), status: Math.abs(balance.erp_balance - Number(statement_balance ?? 0)) < 0.01 ? "approved" : "draft", metadata: { invoices: balance.invoices?.length ?? 0, collections: balance.collections?.length ?? 0 } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "customer_reconciliations.create", subject_table: "customer_reconciliations", subject_id: data?.id });
  return NextResponse.json({ reconciliation: data }, { status: 201 });
}

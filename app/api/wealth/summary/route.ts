import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

function sum(rows: any[] | null, key: string) {
  return (rows ?? []).reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  if (!companyId) return NextResponse.json({ error: "company_id مطلوب" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: companyId, moduleKey: "wealth_dashboard", action: "read" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const [{ data: investments }, { data: cashboxes }, { data: banks }, { data: projects }, { data: sales }, { data: collections }, { data: purchases }, { data: payments }] = await Promise.all([
    supabase.from("investments").select("fair_value").eq("company_id", companyId),
    supabase.from("cashboxes").select("balance").eq("company_id", companyId),
    supabase.from("bank_accounts").select("balance").eq("company_id", companyId),
    supabase.from("projects").select("budget").eq("company_id", companyId),
    supabase.from("sales_invoices").select("total").eq("company_id", companyId),
    supabase.from("customer_collections").select("amount").eq("company_id", companyId),
    supabase.from("purchase_invoices").select("total").eq("company_id", companyId),
    supabase.from("supplier_payments").select("amount").eq("company_id", companyId),
  ]);
  const cash = sum(cashboxes, "balance") + sum(banks, "balance");
  const investmentsValue = sum(investments, "fair_value");
  const projectValue = sum(projects, "budget");
  const receivables = Math.max(sum(sales, "total") - sum(collections, "amount"), 0);
  const payables = Math.max(sum(purchases, "total") - sum(payments, "amount"), 0);
  const assets = cash + investmentsValue + projectValue + receivables;
  const liabilities = payables;
  const netWorth = assets - liabilities;
  const { data: snapshot } = await supabase.from("wealth_snapshots").insert({ company_id: companyId, name_ar: "لقطة ثروة تشغيلية", assets, liabilities, status: "active", metadata: { cash, investments: investmentsValue, projects: projectValue, receivables, payables } }).select("id").single();
  await auditWorkflow({ company_id: companyId, action: "wealth_dashboard.read", subject_table: "wealth_snapshots", subject_id: snapshot?.id });
  return NextResponse.json({ assets, liabilities, net_worth: netWorth, breakdown: { cash, investments: investmentsValue, projects: projectValue, receivables, payables } });
}

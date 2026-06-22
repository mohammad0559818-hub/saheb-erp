import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  if (!companyId) return NextResponse.json({ error: "company_id مطلوب" }, { status: 422 });
  const supabase = createSupabaseServiceClient();
  const [sales, purchases, collections, payments, findings] = await Promise.all([
    supabase.from("sales_invoices").select("total").eq("company_id", companyId),
    supabase.from("purchase_invoices").select("total").eq("company_id", companyId),
    supabase.from("customer_collections").select("amount").eq("company_id", companyId),
    supabase.from("supplier_payments").select("amount").eq("company_id", companyId),
    supabase.from("ai_discrepancy_findings").select("id,severity").eq("company_id", companyId),
  ]);
  const sum = (rows: any[] | null, key: string) => (rows ?? []).reduce((total, row) => total + Number(row[key] ?? 0), 0);
  return NextResponse.json({ sales_total: sum(sales.data, "total"), purchase_total: sum(purchases.data, "total"), collection_total: sum(collections.data, "amount"), payment_total: sum(payments.data, "amount"), ai_discrepancies: findings.data?.length ?? 0 });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { buildTrialBalance, classifyFinancialStatement } from "@/lib/erp/accounting";
import { toCsv, toExcelXml, toSimplePdf } from "@/lib/erp/export";

const contentTypes = { json: "application/json", csv: "text/csv; charset=utf-8", xls: "application/vnd.ms-excel; charset=utf-8", pdf: "application/pdf" } as const;

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  const type = request.nextUrl.searchParams.get("type") ?? "trial_balance";
  const format = (request.nextUrl.searchParams.get("format") ?? "json") as keyof typeof contentTypes;
  if (!companyId) return NextResponse.json({ error: "company_id مطلوب" }, { status: 422 });

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("journal_entry_lines")
    .select("debit,credit,chart_accounts(code,name_ar,account_type)")
    .eq("company_id", companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const normalized = (data ?? []).map((line: any) => ({
    account_code: line.chart_accounts?.code ?? "غير مصنف",
    account_name_ar: line.chart_accounts?.name_ar ?? "غير مصنف",
    account_type: line.chart_accounts?.account_type ?? "other",
    debit: Number(line.debit ?? 0),
    credit: Number(line.credit ?? 0),
  }));

  let rows: Record<string, unknown>[] = buildTrialBalance(normalized).map((row) => ({ الحساب: row.code, الاسم: row.name_ar, مدين: row.debit, دائن: row.credit, الرصيد: row.balance }));
  if (["income_statement", "balance_sheet", "cash_flow"].includes(type)) {
    rows = normalized.map((line: any) => {
      const classified = classifyFinancialStatement(line.account_type, line.debit - line.credit);
      return { التقرير: type, الحساب: line.account_code, الاسم: line.account_name_ar, النوع: line.account_type, التصنيف: classified.statement, المبلغ: classified.amount };
    });
  }

  if (format === "csv") return new NextResponse(toCsv(rows), { headers: { "content-type": contentTypes.csv, "content-disposition": `attachment; filename=${type}.csv` } });
  if (format === "xls") return new NextResponse(toExcelXml(rows), { headers: { "content-type": contentTypes.xls, "content-disposition": `attachment; filename=${type}.xls` } });
  if (format === "pdf") return new NextResponse(toSimplePdf(type, rows), { headers: { "content-type": contentTypes.pdf, "content-disposition": `attachment; filename=${type}.pdf` } });
  return NextResponse.json({ type, rows });
}

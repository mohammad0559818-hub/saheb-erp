import { NextRequest, NextResponse } from "next/server";
import { backupTables, parseDelimited } from "@/lib/erp/backup";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireWorkflowPermission } from "@/lib/workflow-guard";
import { getRequestContext } from "@/lib/request-context";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const companyId = String(form.get("company_id") ?? "");
    const targetTable = String(form.get("target_table") ?? "");
    const sourceSystem = String(form.get("source_system") ?? "external_erp");
    const file = form.get("file");
    if (!backupTables.includes(targetTable)) throw new Error("الجدول الهدف غير مسموح للاستيراد");
    if (!(file instanceof File)) throw new Error("ملف CSV/Excel مطلوب");
    await requireWorkflowPermission(request, { companyId, moduleKey: "import_jobs", action: "create" });
    const rows = parseDelimited(await file.text()).map((row) => ({ ...row, company_id: companyId }));
    const supabase = createSupabaseServiceClient();
    const result = rows.length ? await supabase.from(targetTable).insert(rows).select("id") : { data: [], error: null };
    const context = getRequestContext(request);
    await supabase.from("import_jobs").insert({ company_id: companyId, requested_by: context.userId, source_system: sourceSystem, target_table: targetTable, file_name: file.name, total_rows: rows.length, accepted_rows: result.error ? 0 : rows.length, rejected_rows: result.error ? rows.length : 0, errors: result.error ? [{ message: result.error.message }] : [], name_ar: `استيراد ${targetTable}`, status: result.error ? "rejected" : "approved" });
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ imported: rows.length, target_table: targetTable });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر استيراد البيانات" }, { status: 422 }); }
}

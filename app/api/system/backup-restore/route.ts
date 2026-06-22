import { NextRequest, NextResponse } from "next/server";
import { backupTables } from "@/lib/erp/backup";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireWorkflowPermission } from "@/lib/workflow-guard";
import { getRequestContext } from "@/lib/request-context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = body.company_id ?? body.companyId ?? body.company_id;
    await requireWorkflowPermission(request, { companyId, moduleKey: "backup_jobs", action: "create" });
    if (!body.tables || typeof body.tables !== "object") throw new Error("ملف الاستعادة يجب أن يحتوي tables");
    const supabase = createSupabaseServiceClient();
    const rowCounts: Record<string, number> = {};
    for (const table of backupTables) {
      const rows = body.tables[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const cleaned = table === "companies" ? rows : rows.map((row) => ({ ...row, company_id: companyId }));
      const result = await supabase.from(table).insert(cleaned).select("id");
      if (result.error) throw new Error(`${table}: ${result.error.message}`);
      rowCounts[table] = cleaned.length;
    }
    const context = getRequestContext(request);
    await supabase.from("backup_jobs").insert({ company_id: companyId, requested_by: context.userId, job_type: "restore", file_name: body.file_name, row_counts: rowCounts, name_ar: "استعادة نسخة احتياطية", status: "approved" });
    return NextResponse.json({ restored: rowCounts });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر استعادة النسخة" }, { status: 422 }); }
}

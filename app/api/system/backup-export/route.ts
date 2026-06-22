import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { backupTables } from "@/lib/erp/backup";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireWorkflowPermission } from "@/lib/workflow-guard";
import { getRequestContext } from "@/lib/request-context";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id") ?? undefined;
  try {
    await requireWorkflowPermission(request, { companyId, moduleKey: "backup_jobs", action: "export" });
    const supabase = createSupabaseServiceClient();
    const data: Record<string, unknown[]> = {};
    const rowCounts: Record<string, number> = {};
    for (const table of backupTables) {
      const builder = supabase.from(table).select("*");
      const result = table === "companies" ? await builder.eq("id", companyId) : await builder.eq("company_id", companyId);
      if (!result.error && Array.isArray(result.data)) { data[table] = result.data; rowCounts[table] = result.data.length; }
    }
    const payload = { exported_at: new Date().toISOString(), company_id: companyId, version: 1, tables: data };
    const json = JSON.stringify(payload, null, 2);
    const checksum = createHash("sha256").update(json).digest("hex");
    const context = getRequestContext(request);
    await supabase.from("backup_jobs").insert({ company_id: companyId, requested_by: context.userId, job_type: "export", file_name: `saheb-erp-${companyId}.json`, checksum, row_counts: rowCounts, name_ar: "تصدير نسخة احتياطية", status: "approved" });
    return new NextResponse(json, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename=saheb-erp-${companyId}.json`, "x-checksum-sha256": checksum } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر تصدير النسخة الاحتياطية" }, { status: 422 }); }
}

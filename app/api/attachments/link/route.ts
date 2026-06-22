import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireWorkflowPermission(request, { companyId: body.company_id, moduleKey: "attachments", action: "create" });
    const row = { company_id: body.company_id, branch_id: body.branch_id, attachment_id: body.attachment_id, subject_table: body.subject_table, subject_id: body.subject_id, name_ar: body.name_ar ?? "ربط مرفق", metadata: body.metadata ?? {} };
    const { data, error } = await createSupabaseServiceClient().from("attachment_links").insert(row).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر ربط المرفق" }, { status: 422 }); }
}

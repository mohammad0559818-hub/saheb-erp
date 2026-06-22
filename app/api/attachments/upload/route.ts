import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const body = contentTypeHeader.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const { company_id, branch_id, file_name, content_type, subject_table, subject_id } = body as Record<string, string>;
  if (!company_id || !file_name) return NextResponse.json({ error: "company_id و file_name مطلوبة" }, { status: 422 });
  const safeName = String(file_name).replace(/[^\w.\-؀-ۿ]/g, "_");
  const path = `${company_id}/${Date.now()}-${safeName}`;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "erp-attachments";
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "attachments", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: signed, error: signedError } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 500 });
  const { data, error } = await supabase.from("attachments").insert({ company_id, branch_id, name_ar: safeName, bucket, path, metadata: { content_type, subject_table, subject_id } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "attachments.create", subject_table: "attachments", subject_id: data?.id });
  return NextResponse.json({ attachment: data, upload: signed });
}

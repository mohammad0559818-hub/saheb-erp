import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { attachments = [], ...contract } = body;
  if (!contract.company_id || !contract.contract_no || !contract.name_ar) return NextResponse.json({ error: "company_id و contract_no و name_ar مطلوبة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: contract.company_id, moduleKey: "contracts", action: "create" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("contracts").insert(contract).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (attachments.length) await supabase.from("contract_attachments").insert(attachments.map((attachment: any) => ({ company_id: contract.company_id, branch_id: contract.branch_id, contract_id: data.id, attachment_id: attachment.id, name_ar: attachment.name_ar ?? "مرفق عقد" })));
  await auditWorkflow({ company_id: contract.company_id, branch_id: contract.branch_id, action: "contracts.create", subject_table: "contracts", subject_id: data?.id });
  return NextResponse.json({ contract: data }, { status: 201 });
}

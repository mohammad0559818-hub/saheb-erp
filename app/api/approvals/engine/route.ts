import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, subject_table, subject_id, name_ar = "طلب موافقة", steps = [] } = body;
  if (!company_id || !subject_table || !subject_id) return NextResponse.json({ error: "بيانات طلب الموافقة غير مكتملة" }, { status: 422 });
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "approvals", action: "approve" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: approval, error } = await supabase.from("approvals").insert({ company_id, branch_id, subject_table, subject_id, name_ar, status: "draft", approval_status: "pending" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (steps.length) await supabase.from("approval_steps").insert(steps.map((step: any, index: number) => ({ company_id, branch_id, approval_id: approval.id, step_order: index + 1, approver_id: step.approver_id, role: step.role, name_ar: step.name_ar ?? `خطوة موافقة ${index + 1}` })));
  await writeAuditLog({ company_id, branch_id, action: "approvals.request", subject_table, subject_id });
  return NextResponse.json({ approval }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { approval_id, company_id, branch_id, approver_id, decision, notes } = await request.json();
  if (!approval_id || !company_id || !decision) return NextResponse.json({ error: "approval_id و company_id و decision مطلوبة" }, { status: 422 });
  const status = decision === "approved" ? "approved" : "rejected";
  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "approvals", action: "approve" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("approvals").update({ approval_status: status, status }).eq("id", approval_id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("approval_decisions").insert({ company_id, branch_id, approval_id, approver_id, decision: status, notes, name_ar: `قرار موافقة: ${status}` });
  await writeAuditLog({ company_id, branch_id, actor_id: approver_id, action: `approvals.${status}`, subject_table: "approvals", subject_id: approval_id });
  return NextResponse.json({ approval: data });
}

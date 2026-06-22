import type { NextRequest } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { enforceApiPermission, type ModuleAction } from "@/lib/permissions";
import { getRequestContext } from "@/lib/request-context";

export async function requireWorkflowPermission(request: NextRequest, input: { companyId?: string; moduleKey: string; action: ModuleAction }) {
  const context = getRequestContext(request);
  await enforceApiPermission({ userId: context.userId, companyId: input.companyId ?? context.companyId, moduleKey: input.moduleKey, action: input.action });
}

export async function auditWorkflow(input: { company_id?: string; branch_id?: string; action: string; subject_table: string; subject_id?: string }) {
  if (!input.company_id) return;
  await writeAuditLog(input);
}

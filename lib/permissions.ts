import { createSupabaseServiceClient } from "@/lib/supabase";

export type ModuleAction = "read" | "create" | "update" | "delete" | "approve" | "post" | "export";

export async function assertPermission(userId: string, companyId: string, moduleKey: string, action: ModuleAction) {
  const supabase = createSupabaseServiceClient();
  const { data: membership, error: membershipError } = await supabase
    .from("company_memberships")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .single();
  if (membershipError || !membership) throw new Error("لا يملك المستخدم صلاحية على هذه الشركة");
  if (["owner", "admin"].includes(membership.role)) return true;

  const { data, error } = await supabase
    .from("role_permissions")
    .select("id")
    .eq("company_id", companyId)
    .eq("role", membership.role)
    .in("module_key", [moduleKey, "*"])
    .in("permission", [action, "*"])
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) throw new Error("الصلاحية غير متاحة لهذا الدور");
  return true;
}


export async function enforceApiPermission(input: { userId?: string; companyId?: string; moduleKey: string; action: ModuleAction }) {
  if (!input.userId || !input.companyId) throw new Error("سياق المستخدم والشركة مطلوب لتطبيق الصلاحيات");
  await assertPermission(input.userId, input.companyId, input.moduleKey, input.action);
  return { allowed: true };
}

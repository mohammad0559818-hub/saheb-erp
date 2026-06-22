import { createSupabaseServiceClient } from "@/lib/supabase";

export async function writeAuditLog(input: {
  company_id?: string | null;
  branch_id?: string | null;
  actor_id?: string | null;
  action: string;
  subject_table?: string;
  subject_id?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!input.company_id) return;
  const supabase = createSupabaseServiceClient();
  await supabase.from("activity_logs").insert({
    company_id: input.company_id,
    branch_id: input.branch_id,
    actor_id: input.actor_id,
    action: input.action,
    name_ar: `سجل تدقيق: ${input.action}`,
    metadata: { subject_table: input.subject_table, subject_id: input.subject_id, ...(input.metadata ?? {}) },
  });
}

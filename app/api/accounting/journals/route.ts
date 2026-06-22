import { NextRequest, NextResponse } from "next/server";
import { assertBalancedJournal } from "@/lib/erp/accounting";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { auditWorkflow, requireWorkflowPermission } from "@/lib/workflow-guard";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, branch_id, name_ar, entry_date, lines = [], metadata = {} } = body;
  if (!company_id || !name_ar || !Array.isArray(lines)) return NextResponse.json({ error: "company_id و name_ar و lines مطلوبة" }, { status: 422 });
  let totals;
  try { totals = assertBalancedJournal(lines); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "قيد غير صالح" }, { status: 422 }); }

  try { await requireWorkflowPermission(request, { companyId: company_id, moduleKey: "accounting", action: "post" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 }); }
  const supabase = createSupabaseServiceClient();
  const { data: journal, error } = await supabase.from("journal_entries").insert({ company_id, branch_id, name_ar, entry_date, status: "approved", metadata: { ...metadata, totals } }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const journalLines = lines.map((line: any) => ({ company_id, branch_id, journal_entry_id: journal.id, account_id: line.account_id, description: line.description, debit: Number(line.debit ?? 0), credit: Number(line.credit ?? 0) }));
  const { error: linesError } = await supabase.from("journal_entry_lines").insert(journalLines);
  if (linesError) return NextResponse.json({ error: linesError.message }, { status: 500 });
  await auditWorkflow({ company_id, branch_id, action: "accounting.post", subject_table: "journal_entries", subject_id: journal?.id });
  return NextResponse.json({ journal, lines: journalLines, totals }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { parseGenericRecord, parseListQuery, parseUpdateRecord } from "@/lib/api";
import { getModule } from "@/lib/modules";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/audit";
import { getRequestContext } from "@/lib/request-context";
import { enforceApiPermission } from "@/lib/permissions";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const module = getModule(key);
  if (!module) return jsonError("Unknown ERP module", 404);

  let query;
  try { query = parseListQuery(Object.fromEntries(request.nextUrl.searchParams)); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid query", 422); }
  const context = getRequestContext(request);
  try { await enforceApiPermission({ userId: context.userId, companyId: query.company_id ?? context.companyId, moduleKey: module.key, action: "read" }); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "غير مصرح", 403); }
  const supabase = createSupabaseServiceClient();
  let builder = supabase
    .from(module.table)
    .select("*", { count: "exact" })
    .range(query.offset, query.offset + query.limit - 1)
    .order("created_at", { ascending: false });

  if (query.company_id) builder = builder.eq("company_id", query.company_id);
  if (query.branch_id) builder = builder.eq("branch_id", query.branch_id);
  if (query.warehouse_id) builder = builder.eq("warehouse_id", query.warehouse_id);
  if (query.status) builder = builder.eq("status", query.status);
  if (query.search) builder = builder.ilike("name_ar", `%${query.search}%`);

  const { data, error, count } = await builder;
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ module: module.key, count, data });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const module = getModule(key);
  if (!module) return jsonError("Unknown ERP module", 404);

  let payload;
  try { payload = parseGenericRecord(await request.json()); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid payload", 422); }

  const context = getRequestContext(request);
  try { await enforceApiPermission({ userId: context.userId, companyId: payload.company_id as string, moduleKey: module.key, action: "create" }); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "غير مصرح", 403); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from(module.table).insert(payload).select("*").single();
  if (error) return jsonError(error.message, 500);
  await writeAuditLog({ company_id: payload.company_id as string, branch_id: payload.branch_id as string | undefined, action: `${module.key}.create`, subject_table: module.table, subject_id: data?.id as string | undefined });
  return NextResponse.json({ module: module.key, data }, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const module = getModule(key);
  if (!module) return jsonError("Unknown ERP module", 404);

  let payload;
  try { payload = parseUpdateRecord(await request.json()); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid payload", 422); }

  const { id, ...changes } = payload;
  const context = getRequestContext(request);
  try { await enforceApiPermission({ userId: context.userId, companyId: changes.company_id as string | undefined ?? context.companyId, moduleKey: module.key, action: "update" }); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "غير مصرح", 403); }
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from(module.table).update(changes).eq("id", id).select("*").single();
  if (error) return jsonError(error.message, 500);
  await writeAuditLog({ company_id: changes.company_id as string | undefined, branch_id: changes.branch_id as string | undefined, action: `${module.key}.update`, subject_table: module.table, subject_id: id as string });
  return NextResponse.json({ module: module.key, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module: key } = await params;
  const module = getModule(key);
  if (!module) return jsonError("Unknown ERP module", 404);
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return jsonError("Missing id query parameter", 422);

  const context = getRequestContext(request);
  const companyId = request.nextUrl.searchParams.get("company_id") ?? context.companyId;
  try { await enforceApiPermission({ userId: context.userId, companyId, moduleKey: module.key, action: "delete" }); }
  catch (error) { return jsonError(error instanceof Error ? error.message : "غير مصرح", 403); }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from(module.table).delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  await writeAuditLog({ company_id: companyId, action: `${module.key}.delete`, subject_table: module.table, subject_id: id });
  return NextResponse.json({ module: module.key, deleted: id });
}

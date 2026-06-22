import { NextRequest, NextResponse } from "next/server";
import { assertPermission, type ModuleAction } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  const companyId = request.nextUrl.searchParams.get("company_id");
  const moduleKey = request.nextUrl.searchParams.get("module_key");
  const action = request.nextUrl.searchParams.get("action") as ModuleAction | null;
  if (!userId || !companyId || !moduleKey || !action) return NextResponse.json({ allowed: false, error: "user_id و company_id و module_key و action مطلوبة" }, { status: 422 });
  try {
    await assertPermission(userId, companyId, moduleKey, action);
    return NextResponse.json({ allowed: true });
  } catch (error) {
    return NextResponse.json({ allowed: false, error: error instanceof Error ? error.message : "غير مصرح" }, { status: 403 });
  }
}

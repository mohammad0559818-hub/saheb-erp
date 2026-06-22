import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

async function createSupabaseOwnerUser(input: { email: string; password: string; name_ar: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service env vars are missing");
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}`, "content-type": "application/json" },
    body: JSON.stringify({ email: input.email, password: input.password, email_confirm: true, user_metadata: { name_ar: input.name_ar, role: "owner" } }),
    cache: "no-store",
  });
  const user = await response.json().catch(() => null);
  if (!response.ok || typeof user?.id !== "string") throw new Error(user?.message ?? "تعذر إنشاء مستخدم المالك في Supabase Auth");
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name_ar, country = "SA", owner_name_ar, owner_email, owner_password } = body;
    if (!company_name_ar || !owner_name_ar || !owner_email || !owner_password) {
      return NextResponse.json({ error: "بيانات الشركة والمالك مطلوبة" }, { status: 422 });
    }

    const supabase = createSupabaseServiceClient();
    const existing = await supabase.from("companies").select("id", { count: "exact" }).range(0, 0);
    if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
    if ((existing.count ?? 0) > 0 && process.env.SAHEB_ALLOW_SETUP_AFTER_COMPANY !== "true") {
      return NextResponse.json({ error: "تم إعداد النظام مسبقاً. استخدم إدارة المستخدمين لإضافة ملاك جدد." }, { status: 409 });
    }

    const user = await createSupabaseOwnerUser({ email: owner_email, password: owner_password, name_ar: owner_name_ar });
    const companyResult = await supabase
      .from("companies")
      .insert({ name_ar: company_name_ar, country, status: "active", metadata: { setup_wizard: true } })
      .select("*")
      .single();
    if (companyResult.error) return NextResponse.json({ error: companyResult.error.message }, { status: 500 });

    const membership = await supabase
      .from("company_memberships")
      .insert({ company_id: companyResult.data.id, user_id: user.id, role: "owner" })
      .select("*")
      .single();
    if (membership.error) return NextResponse.json({ error: membership.error.message }, { status: 500 });

    await supabase.from("activity_logs").insert({
      company_id: companyResult.data.id,
      actor_id: user.id,
      action: "setup.owner_created",
      name_ar: "إنشاء المالك الأول والشركة الأولى",
      metadata: { owner_email },
    });

    return NextResponse.json({ company: companyResult.data, membership: membership.data, owner: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر إكمال الإعداد الأولي" }, { status: 422 });
  }
}

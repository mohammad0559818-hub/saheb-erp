import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("bank_accounts").insert({ currency: "SAR", balance: 0, status: "active", ...body }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bank: data }, { status: 201 });
}

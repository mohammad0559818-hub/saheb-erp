import { NextResponse } from "next/server";
import { erpModules } from "@/lib/modules";

export function GET() {
  return NextResponse.json({ modules: erpModules, count: erpModules.length });
}

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ schedule: "daily", retention_days: 30, targets: ["Supabase PITR", "Storage bucket export", "Vercel environment backup"], runbook: "docs/BACKUP_RESTORE.md" });
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!process.env.ZATCA_CLIENT_ID || !process.env.ZATCA_CLIENT_SECRET) return NextResponse.json({ error: "ZATCA provider credentials are not configured" }, { status: 503 });
  return NextResponse.json({ status: "queued", environment: process.env.ZATCA_ENVIRONMENT ?? "sandbox", document: payload.document_id });
}

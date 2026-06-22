import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) return new NextResponse(challenge);
  return NextResponse.json({ error: "WhatsApp webhook verification failed" }, { status: 403 });
}

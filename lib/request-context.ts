import type { NextRequest } from "next/server";

export function getRequestContext(request: NextRequest) {
  return {
    userId: request.headers.get("x-saheb-user-id") ?? request.nextUrl.searchParams.get("user_id") ?? undefined,
    companyId: request.headers.get("x-saheb-company-id") ?? request.nextUrl.searchParams.get("company_id") ?? undefined,
  };
}

# SAHEB ERP Changes Since Commit 9458f76

## Phase 1 — Critical production blockers fixed

- Added `package-lock.json` to make dependency installation deterministic for CI/deployment.
- Added Supabase CLI as a dev dependency because `npm run db:types` uses `supabase gen types`.
- Expanded `.env.example` with WhatsApp, ZATCA/UAE tax provider, backup encryption, and default company variables.
- Added Next.js middleware for dashboard/API route protection using `saheb_access_token` cookie or Authorization header.
- Updated login flow to store the returned Supabase access token in a cookie and respect the `next` redirect parameter.
- Made generic ERP permission enforcement strict when request user/company context is missing.
- Added a simple binary PDF export response for accounting reports instead of printable HTML fallback.
- Added WhatsApp webhook verification endpoint and ZATCA e-invoice integration guard endpoint.
- Added dashboard KPI hydration from `/api/dashboard/kpis` when `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_DEFAULT_COMPANY_ID` are configured.
- Added resource screen POST form action wiring to the configured API endpoint.
- Added smoke-test script and `npm run smoke` for critical route validation.
- Added Supabase storage bucket provisioning note to schema and production role permission seed data.

## Remaining external requirements

The remaining items require external production services or credentials: real Supabase project provisioning, certified ZATCA/UAE provider credentials, Meta WhatsApp Business API credentials, and actual CI execution in a runner with npm/GitHub access.

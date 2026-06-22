# REMAINING BLOCKERS — SAHEB ERP

## External deployment prerequisites

1. **Production Supabase project credentials must be supplied outside the repository.** The app now has complete variable coverage in `.env.example`, but the real URL, anon key, and service role key must be created in Supabase and injected into Vercel.
2. **Certified tax/e-invoicing provider onboarding is external.** The VAT/e-invoice guard route prevents accidental submission without configured ZATCA/UAE credentials, but certification and provider credentials must be completed by the operator.
3. **Meta WhatsApp Business credentials are external.** Webhook verification and order processing are implemented, but the Meta app access token and webhook token must be configured in production.
4. **Full browser E2E execution requires a runner with npm and browser access.** Smoke tests and CI scripts exist; end-to-end workflow tests should run in GitHub Actions/Vercel preview after registry access is available.
5. **Backup scheduling is external.** The backup/restore runbook exists and the app exposes a backup plan endpoint, but actual encrypted backup jobs must be scheduled in Supabase/platform operations.

## Resolved application blockers

- Resource screens now submit JSON payloads to their configured APIs.
- Generic module pages now submit to `/api/erp/[module]` instead of being static forms.
- Supabase Storage bucket and authenticated object policies are provisioned in `supabase/schema.sql`.
- Production seed data no longer inserts sample companies, balances, projects, investments, or WhatsApp orders.
- Dashboard KPIs now use API/database values with zero-safe fallbacks instead of generated figures.
- Generic ERP DELETE now enforces permissions and writes audit logs.
- Accounting journal entry and inventory valuation endpoints are available for operational workflows.
- WhatsApp orders can be converted into draft sales invoices when matched customer and item data are supplied.

## Environment blockers observed here

1. `npm install` cannot complete because registry access to scoped packages is blocked by the runner.
2. `git push` cannot complete because GitHub HTTPS access is blocked with a proxy `403`.

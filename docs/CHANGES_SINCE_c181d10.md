# SAHEB ERP Changes Since Commit c181d10

## Production blocker remediation

- Connected reusable resource screens to real JSON POST requests with success/error feedback instead of static form controls.
- Connected generic module pages to `/api/erp/[module]` with named required inputs and client-side submission.
- Enhanced middleware to propagate authenticated Supabase JWT user context and selected company context to API handlers.
- Added permission enforcement and audit logging to generic ERP delete operations.
- Added an accounting journal posting endpoint with balanced debit/credit validation and journal line persistence.
- Added an inventory valuation endpoint that summarizes stock valuation layers by item and warehouse.
- Reworked the wealth summary API to calculate assets, receivables, payables, liabilities, and net worth from operational tables.
- Completed WhatsApp order processing so matched orders can create draft sales invoices and invoice lines.
- Provisioned the private Supabase Storage attachments bucket and authenticated object policies in `supabase/schema.sql`.
- Removed sample operating records from `supabase/seed.sql`; production data must be created from real tenant/user setup.
- Reworked dashboard KPI cards/charts to use API/database values with zero-safe fallbacks instead of generated figures.
- Updated deployment readiness and blocker documentation to distinguish resolved code blockers from external production prerequisites.

## Remaining external prerequisites

- Apply the schema to a real Supabase project and create production users, memberships, role permissions, VAT setup, and opening balances.
- Configure Vercel with real Supabase, WhatsApp, tax/e-invoicing, backup and app URL secrets.
- Run dependency installation, typecheck, build, smoke tests, and browser E2E in a network-enabled CI/Vercel environment.

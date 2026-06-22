# DEPLOYMENT READINESS AUDIT — SAHEB ERP

Audit target: current codebase after the production blocker remediation phase following commit `c181d10`.

## 1. Dependencies

`package.json` declares all runtime/build dependencies required by the current app: Next.js, React, TypeScript, Tailwind, PostCSS, ESLint, Node/React types, and the Supabase CLI for type generation. `package-lock.json` is present for deterministic CI installs.

No application dependency is intentionally missing. The remaining dependency requirement is operational: CI/Vercel must run in an environment that can reach the npm registry.

## 2. Environment variables

Required variables are documented in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `ZATCA_ENVIRONMENT`
- `ZATCA_CLIENT_ID`
- `ZATCA_CLIENT_SECRET`
- `UAE_TAX_PROVIDER_KEY`
- `BACKUP_ENCRYPTION_KEY`
- `NEXT_PUBLIC_DEFAULT_COMPANY_ID`

## 3. Placeholder/non-final implementation audit

Resolved in this phase:

1. Resource screens submit JSON to their configured APIs and show success/error state.
2. Generic module screens submit to `/api/erp/[module]` with typed field names.
3. Dashboard cards and chart bars use KPI and wealth API values, with zero-safe fallback when env vars are absent.
4. Supabase Storage bucket and object policies are provisioned in SQL.
5. Seed SQL is production-safe and does not insert sample operating records.
6. Generic ERP delete operations enforce role permissions and create audit logs.
7. Accounting journal posting and inventory valuation endpoints were added.
8. WhatsApp order processing can create draft sales invoices after customer/item matching.

## 4. API routes requiring external credentials

- `/api/whatsapp/webhook` and `/api/whatsapp/orders` are implemented; production message ingestion requires Meta WhatsApp credentials and webhook configuration.
- `/api/vat/e-invoice` guards certified submission; production tax submission requires ZATCA/UAE provider credentials.
- `/api/system/backup-plan` returns the backup plan; actual scheduled encrypted backups are configured outside the app.

## 5. Screen functionality

- Dashboard, module pages, resource screens, attachment upload, advanced workflows, search, audit/activity, approvals, wealth, reconciliation, shipping, contracts, users/roles, notifications, reporting, settings and company profile screens route to real APIs/tables.
- Client-side workflow-specific validation can be enhanced after user acceptance testing, but all screens now have operational API connectivity rather than static-only controls.

## 6. Remaining production blockers

1. Provision the production Supabase project and apply `supabase/schema.sql`.
2. Create real users, companies, memberships, role permissions, VAT registrations, opening balances, and master data.
3. Configure Vercel environment variables with production values.
4. Complete external ZATCA/UAE and Meta WhatsApp onboarding.
5. Run `npm install`, `npm run typecheck`, `npm run build`, and browser E2E tests in CI/Vercel preview.
6. Configure scheduled backup/restore operations and monitoring outside this repository.
7. Current runner cannot install dependencies or push to GitHub because network access is blocked with proxy/registry errors.

## 7. Deployment guide

### GitHub

1. Push the current branch to `mohammad0559818-hub/saheb-erp` from a network with GitHub access.
2. Confirm `package-lock.json` is committed.
3. Enable branch protection and require `.github/workflows/ci.yml` to pass.
4. Store production secrets only in Vercel/Supabase.

### Supabase

1. Create the production Supabase project.
2. Run `supabase/schema.sql` in the SQL editor or with the Supabase CLI.
3. Confirm bucket `erp-attachments` exists and storage policies were created.
4. Create real Supabase Auth users.
5. Insert real `companies`, `company_memberships`, `role_permissions`, VAT records, branches, warehouses, opening balances and master data.
6. Enable backups/PITR and configure monitoring.

### Vercel

1. Import the GitHub repository.
2. Set Node.js 20+.
3. Configure all variables from `.env.example` using production values.
4. Deploy preview and run `/api/health`, `/dashboard`, `/api/erp?company_id=<company>`, `/api/dashboard/kpis?company_id=<company>` and the smoke script.
5. Promote to production after typecheck/build/E2E pass.

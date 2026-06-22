# SAHEB ERP Deployment Handoff

Handoff baseline: commit `fa32e59`.

This handoff is for the production deployment team. It does not introduce new business modules or alter runtime business logic. It packages the audited SAHEB ERP codebase and lists the exact external actions required to go live on GitHub, Supabase, and Vercel.

## 1. Handoff artifacts

- Source repository directory: `/workspace/saheb-erp`
- Production ZIP package: `/workspace/saheb-erp-project.zip`
- Database schema: `supabase/schema.sql`
- Production seed guidance: `supabase/seed.sql`
- Environment template: `.env.example`
- CI workflow: `.github/workflows/ci.yml`
- Smoke test script: `scripts/smoke-test.mjs`
- Final production audit: `docs/FINAL_PRODUCTION_AUDIT.md`
- Go-live checklist: `docs/GO_LIVE_CHECKLIST.md`

## 2. Deployment sequence

### Step 1 — GitHub

1. Push the current branch from a network that can access GitHub.
2. Confirm `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `.env.example`, `supabase/schema.sql`, `supabase/seed.sql`, and `docs/*` are present.
3. Enable branch protection before production promotion.
4. Require the CI workflow to pass before merging into the production branch.

### Step 2 — Supabase

1. Create the production Supabase project.
2. Apply `supabase/schema.sql` through the SQL editor or Supabase CLI.
3. Verify the private `erp-attachments` Storage bucket exists.
4. Verify authenticated storage policies for select, insert, and update on `erp-attachments` exist.
5. Create Supabase Auth users for the initial production administrators.
6. Insert real tenant data: companies, memberships, role permissions, VAT records, branches, warehouses, chart accounts, opening balances, customers, suppliers, inventory items, projects, contracts, and investments.
7. Enable PITR/backups and document a restore test.

### Step 3 — Vercel

1. Import the GitHub repository into Vercel.
2. Use Node.js 20 or newer.
3. Configure every variable from `.env.example` with production values.
4. Deploy a preview environment.
5. Run CI, smoke tests, and manual workflow checks.
6. Promote to production only after the checklist in `docs/GO_LIVE_CHECKLIST.md` is complete.

## 3. Required environment variables

Configure these in Vercel, not in source control:

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

## 4. Verification commands

Run these from the repository root in a network-enabled deployment environment:

```bash
npm install
npm run typecheck
npm run build
NEXT_PUBLIC_APP_URL=https://<preview-domain> npm run smoke
```

Then verify the following URLs in the preview deployment:

- `/api/health`
- `/api/erp`
- `/dashboard`
- `/dashboard/reports`
- `/dashboard/attachments`
- `/api/dashboard/kpis?company_id=<production-company-id>`
- `/api/wealth/summary?company_id=<production-company-id>`
- `/api/accounting/reports?company_id=<production-company-id>&type=trial_balance`

## 5. Final external blockers

There are no remaining repository-code blockers in the final audit. The deployment team must complete these external blockers before production traffic:

1. Production Supabase project provisioning and schema application.
2. Production Vercel environment secrets.
3. Real users, memberships, permissions, VAT records, master data, and opening balances.
4. Meta WhatsApp Business webhook and token setup.
5. ZATCA/UAE tax/e-invoicing provider onboarding.
6. CI/typecheck/build/smoke/E2E execution in a network-enabled runner.
7. Scheduled encrypted backups, restore testing, monitoring, and alerting.

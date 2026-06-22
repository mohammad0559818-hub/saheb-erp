# SAHEB ERP | صاحب ERP

Production-ready Arabic ERP starter built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **PostgreSQL** for Saudi Arabia and UAE operations.

## Included modules

Companies, Branches, Warehouses, Customers, Customer Reconciliation, Suppliers, Supplier Reconciliation, Dubai Shipping Office, Inventory, Sales, Purchases, Accounting, Cashboxes, Main Vault, Banks, Transfers, Expenses, Payroll, Projects, Contracts, Investments, Attachments, Notifications, Approvals, Role Permissions, Activity/Audit Logs, Mobile Sales Representatives, AI Discrepancy Analysis, AI Analytics, Multi VAT, and Wealth Dashboard.

## Core capabilities

- Arabic RTL interface and navigation.
- Multi-company, multi-branch, and multi-warehouse data model.
- Multiple VAT numbers per company for Saudi Arabia and UAE.
- Supabase Auth login flow and company membership model.
- Tenant-aware Row Level Security policies keyed by authenticated user memberships.
- Generic module catalogue at `/api/erp` and module API at `/api/erp/[module]` with list, create, update, and delete operations.
- Accounting APIs for trial balance, income statement, balance sheet, cash flow, and CSV/Excel/printable-PDF exports.
- Sales and purchase invoice workflows with line calculations and VAT totals.
- Inventory movement API with stock valuation layers and movement value calculation.
- Supabase Storage signed upload workflow for attachments.
- Customer and supplier ledger reconciliation APIs with ERP balance comparison.
- Cashbox/safe/bank transfer workflow with cash movement audit trail.
- Dubai shipping workflow with landed-cost allocation.
- Contract creation with attachment linking, representative collection handover, owner wealth snapshots, and AI discrepancy analysis.
- Deployment-ready environment template, schema, seed data, and Vercel instructions.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

For a fresh production deployment, open `/setup` first to create the first Supabase Auth owner, company, and owner membership. The setup wizard locks itself after the first company exists unless `SAHEB_ALLOW_SETUP_AFTER_COMPANY=true` is explicitly set for controlled recovery.

## Database setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `supabase/schema.sql`.
4. Optionally run `supabase/seed.sql` for Saudi and UAE production companies.
5. Create a private storage bucket named `erp-attachments`.
6. Add your Supabase URL, anon key, and service role key to `.env.local`.
7. Create users in Supabase Auth and insert rows into `company_memberships` for access.

## API examples

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/erp
curl "http://localhost:3000/api/erp/companies?limit=10"
curl -X POST http://localhost:3000/api/erp/customers \
  -H 'Content-Type: application/json' \
  -d '{"company_id":"00000000-0000-0000-0000-000000000001","name_ar":"عميل تشغيلي","metadata":{}}'
curl -X PATCH http://localhost:3000/api/erp/customers \
  -H 'Content-Type: application/json' \
  -d '{"id":"CUSTOMER_UUID","status":"approved"}'
curl -X DELETE "http://localhost:3000/api/erp/customers?id=CUSTOMER_UUID"
curl "http://localhost:3000/api/accounting/reports?company_id=00000000-0000-0000-0000-000000000001&type=trial_balance&format=xls"
curl -X POST http://localhost:3000/api/attachments/upload -H 'Content-Type: application/json' -d '{"company_id":"00000000-0000-0000-0000-000000000001","file_name":"invoice.pdf"}'
curl "http://localhost:3000/api/customers/reconciliation?company_id=00000000-0000-0000-0000-000000000001&customer_id=CUSTOMER_UUID"
curl -X POST http://localhost:3000/api/treasury/transfers -H 'Content-Type: application/json' -d '{"company_id":"00000000-0000-0000-0000-000000000001","from_type":"cashbox","from_id":"FROM_UUID","to_type":"bank","to_id":"TO_UUID","amount":500}'
curl "http://localhost:3000/api/wealth/summary?company_id=00000000-0000-0000-0000-000000000001"
```

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy with `npm run build`.

### Supabase

- Apply `supabase/schema.sql` before first deploy.
- Use `company_memberships` to control company-level access.
- Store attachments in the private `erp-attachments` bucket.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and rotate it regularly.

## Production checklist

- Replace starter generic forms with module-specific transaction workflows.
- Add ZATCA/UAE e-invoicing integrations and QR/UBL generation.
- Add immutable accounting posting tables for journal lines and subledger reconciliation.
- Connect Dubai shipping shipments to landed cost allocation and purchase receipts.
- Wire AI discrepancy findings to approvals, notifications, and reconciliation tasks.
- Add background jobs for AI forecasts, notifications, and bank synchronization.
- Add Playwright end-to-end tests for login, invoice posting, approvals, and stock transfers.

## Implementation report

See `docs/IMPLEMENTATION_REPORT.md` for the final audit and implementation report.

See `docs/CHANGES_SINCE_88c5233.md` for the incremental report requested for work continued from commit `88c5233`.

See `docs/CHANGES_SINCE_d7ba709.md` for the production workflow additions completed after commit `d7ba709`.

## Production deployment documentation

- `docs/FINAL_IMPLEMENTATION_REPORT.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/CHANGES_SINCE_5945c68.md`

## Final QA and production readiness

- `docs/FINAL_QA_REPORT.md`
- `docs/PRODUCTION_CHECKLIST.md`
- `docs/KNOWN_LIMITATIONS.md`
- `docs/BACKUP_RESTORE.md`
- `docs/CHANGES_SINCE_e82d418.md`

- [Production completion report](docs/PRODUCTION_COMPLETION_REPORT.md)
- [UI accessibility and route coverage audit](docs/UI_ACCESSIBILITY_AUDIT.md)
- [Supabase production testing runbook](docs/SUPABASE_PRODUCTION_TESTING.md)

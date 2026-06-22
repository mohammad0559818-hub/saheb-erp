# SAHEB ERP GO-LIVE CHECKLIST

## 1. Repository and CI

- [ ] Push the final branch to `mohammad0559818-hub/saheb-erp` from a network with GitHub access.
- [ ] Confirm `package-lock.json` is committed.
- [ ] Run GitHub Actions and require `npm install`, `npm run typecheck`, and `npm run build` to pass.
- [ ] Run `npm run smoke` against the deployed preview URL.
- [ ] Complete browser E2E tests for sales-to-cash, purchase-to-payment, inventory transfers, approvals, reconciliations, contracts, attachments, wealth dashboard, and WhatsApp order conversion.

## 2. Supabase

- [ ] Create the production Supabase project.
- [ ] Apply `supabase/schema.sql`.
- [ ] Confirm private bucket `erp-attachments` exists.
- [ ] Confirm authenticated storage policies for select/insert/update on `erp-attachments` exist.
- [ ] Create production Auth users.
- [ ] Insert real `companies`, `company_memberships`, `role_permissions`, VAT records, branches, warehouses, chart accounts, opening balances, inventory items, customers, suppliers, contracts, projects, and investments.
- [ ] Enable PITR/backups and document restore-test evidence.

## 3. Vercel

- [ ] Import the GitHub repository into Vercel.
- [ ] Use Node.js 20+.
- [ ] Configure all variables from `.env.example` with production values.
- [ ] Deploy preview and verify `/api/health`, `/dashboard`, `/api/erp`, `/api/dashboard/kpis`, `/api/wealth/summary`, and `/api/accounting/reports`.
- [ ] Promote to production only after CI, smoke tests, and E2E pass.

## 4. External integrations

- [ ] Configure Meta WhatsApp webhook URL and verify token.
- [ ] Configure Meta WhatsApp access token and message permissions.
- [ ] Complete ZATCA/UAE e-invoicing provider onboarding.
- [ ] Store provider credentials in Vercel environment variables only.
- [ ] Configure scheduled encrypted backups and operational monitoring outside the app.

## 5. Business sign-off

- [ ] Finance validates trial balance, income statement, balance sheet, cash flow and journal posting.
- [ ] Warehouse validates stock movements, transfers and valuation.
- [ ] Sales validates invoices, collections and WhatsApp conversion.
- [ ] Procurement validates purchase invoices and supplier payments.
- [ ] Management validates wealth dashboard and KPIs.
- [ ] Admin validates users, roles, permissions, audit logs and approvals.

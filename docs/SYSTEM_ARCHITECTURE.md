# SYSTEM ARCHITECTURE — SAHEB ERP

## Frontend

Next.js App Router renders Arabic RTL pages under `app/`, with shared navigation in `components/app-shell.tsx` and reusable production screens through `components/resource-screen.tsx`.

## API layer

API routes under `app/api/*` expose generic ERP CRUD and specialized workflows for accounting, inventory, sales, purchasing, treasury, approvals, VAT, WhatsApp intake, attachments, analytics, and wealth.

## Data layer

Supabase PostgreSQL stores tenant-scoped ERP data. `supabase/schema.sql` defines company isolation, business tables, ledger views, RLS policy generation, and update triggers.

## Storage

Supabase Storage bucket `erp-attachments` stores files. `/api/attachments/upload` creates signed upload URLs and records metadata in `attachments`.

## Security

`company_memberships`, `role_permissions`, and `/api/permissions/check` support role-based access. `lib/audit.ts` records activity logs for sensitive changes.

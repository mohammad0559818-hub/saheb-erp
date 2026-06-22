# Supabase Production Testing Runbook

Use this runbook to verify SAHEB ERP as a real Supabase-backed production deployment rather than a browser-local prototype.

## 1. Provision Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create the private Storage bucket configured by `SUPABASE_STORAGE_BUCKET` (default: `erp-attachments`).
4. Open `/setup` and create the first owner/company, or create at least one Supabase Auth user manually.
5. If creating records manually, insert a `companies` row and a matching `company_memberships` row for the user with role `owner` or `admin`.

## 2. Configure Vercel environment variables

Set the values from `.env.example` in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_APP_URL`
- WhatsApp/ZATCA/UAE tax variables when those integrations are enabled.

## 3. Verify authentication and roles

1. Visit `/setup` on a fresh deployment and create the first owner/company.
2. Visit `/auth/login`.
3. Sign in with the Supabase Auth user. The app loads the first owner membership and stores the active company context cookie automatically.
4. Open `/dashboard`.
5. Open `/api/permissions/check?company_id=<COMPANY_ID>&user_id=<USER_ID>&module_key=customers&action=read` and verify the permission response.

## 4. Verify persistent CRUD

For each module page, create a record, search/list it, update it, and delete it. Start with:

- `/dashboard/companies`
- `/dashboard/branches`
- `/dashboard/warehouses`
- `/dashboard/customers`
- `/dashboard/suppliers`
- `/dashboard/inventory`
- `/dashboard/sales`
- `/dashboard/purchases`
- `/dashboard/cashboxes`
- `/dashboard/banks`
- `/dashboard/treasury-transfers`
- `/dashboard/expenses`
- `/dashboard/reports`

Every list/update/delete operation goes through `/api/erp/[module]`, which enforces company membership and role permissions.

## 5. Verify uploads and imports

- Use `/dashboard/attachments` to upload a PDF/image/Excel file and confirm a row is created in `attachments`.
- Use `/dashboard/mobile-sales-reps` to create a representative, then upload a file with `subject_table=mobile_sales_representatives`.
- Use `/dashboard/import-data` with a CSV whose first row matches the target table columns and confirm `import_jobs` is written.
- Use `/dashboard/backup-restore` and `/api/system/backup-export?company_id=<COMPANY_ID>` to export Supabase data.

## 6. Verify audit logs

Open `/dashboard/audit-logs` after creating/updating/deleting records. Confirm rows are written to `activity_logs` for workflow and CRUD operations.

## 7. Vercel build

In a network-enabled CI runner:

```bash
npm install
npm run typecheck
npm run build
```

The local Codex runner used for development blocks npm registry access, so the build must be verified in GitHub Actions or Vercel.

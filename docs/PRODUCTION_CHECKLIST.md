# PRODUCTION CHECKLIST — SAHEB ERP

- Configure Supabase production project.
- Run `supabase/schema.sql`.
- Use `supabase/seed.sql` only as a production bootstrap note file; create real tenant data through controlled onboarding.
- Create private `erp-attachments` bucket.
- Configure Vercel environment variables.
- Create admin user and company memberships.
- Configure role permissions per module/action.
- Enable Supabase PITR backups.
- Confirm `/api/health`, `/api/erp`, `/dashboard`, `/dashboard/reports`, and `/dashboard/attachments`.
- Run `npm run typecheck` and `npm run build` in CI.
- Add local compliance integrations for ZATCA/UAE e-invoicing before issuing official invoices.

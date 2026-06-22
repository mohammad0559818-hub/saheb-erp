# DEPLOYMENT GUIDE — Vercel + Supabase

## 1. Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Review `supabase/seed.sql`; it intentionally creates no sample business data for production.
4. Create a private Storage bucket named `erp-attachments`.
5. Create users in Supabase Auth.
6. Insert `company_memberships` rows for each user/company.

## 2. Environment variables

Set these in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 3. Vercel

1. Import the GitHub repository.
2. Use the default Next.js build command `npm run build`.
3. Confirm Node.js 20+.
4. Deploy.

## 4. Smoke tests

- `/api/health`
- `/api/erp`
- `/dashboard`
- `/dashboard/reports`
- `/dashboard/attachments`
